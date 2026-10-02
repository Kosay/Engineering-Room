import { Router, Request, Response } from 'express';
import { FieldValue, type DocumentReference } from 'firebase-admin/firestore';
import { requireFirebaseUser } from './auth';
import { getAdminDb } from './firebase-admin';
import { runProviderAnalysis } from './ai-provider-gateway';
import { AgentRole, AIProviderId, Claim, Experiment, InvestigationMessage } from '../src/types';
import { InvestigationContext } from '../src/providers/ai-provider.interface';
import { ContextBuilder } from '../src/orchestrator/context-builder';

export const aiRouter = Router();

function isProviderId(value: unknown): value is AIProviderId {
  return value === 'gemini' || value === 'openai' || value === 'anthropic' || value === 'deepseek';
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function stableId(prefix: string, value: string): string {
  // Firestore document IDs may safely contain this deterministic hexadecimal digest.
  let h1 = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h1 ^= value.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return `${prefix}-${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

function investigationPath(orgId: string, roomId: string, invId: string) {
  return getAdminDb().collection('organizations').doc(orgId).collection('rooms').doc(roomId)
    .collection('investigations').doc(invId);
}

async function loadInvestigationState(orgId: string, roomId: string, invId: string) {
  const db = getAdminDb();
  const orgRef = db.collection('organizations').doc(orgId);
  const roomRef = orgRef.collection('rooms').doc(roomId);
  const invRef = roomRef.collection('investigations').doc(invId);

  const [orgSnap, roomSnap, invSnap] = await Promise.all([
    orgRef.get(),
    roomRef.get(),
    invRef.get(),
  ]);

  if (!orgSnap.exists || orgSnap.data()?.ownerId === undefined) throw new Error('Organization not found.');
  if (!roomSnap.exists) throw new Error('Room not found.');
  if (!invSnap.exists) throw new Error('Investigation not found.');
  return { db, orgSnap, roomSnap, invSnap, orgRef, roomRef, invRef };
}

async function buildServerContext(orgId: string, roomId: string, invId: string): Promise<{
  context: InvestigationContext;
  investigation: any;
  claims: Claim[];
}> {
  const state = await loadInvestigationState(orgId, roomId, invId);
  const inv = { id: state.invSnap.id, ...state.invSnap.data() } as any;
  const [claimsSnap, evidenceSnap, experimentsSnap] = await Promise.all([
    state.invRef.collection('claims').get(),
    state.invRef.collection('evidence').get(),
    state.invRef.collection('experiments').get(),
  ]);
  const claims = claimsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Claim[];
  const evidence = evidenceSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  const experiments = experimentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Experiment[];
  return { context: ContextBuilder.buildContext(inv, claims, evidence, experiments), investigation: inv, claims };
}

aiRouter.post(['/analyze', '/agent-turn'], async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    const { providerId = 'gemini', role = 'Architect', context } = req.body as {
      providerId?: unknown; role?: AgentRole; context?: InvestigationContext;
    };
    if (!isProviderId(providerId)) return res.status(400).json({ error: 'Invalid providerId.' });
    if (!context || typeof context.question !== 'string') {
      return res.status(400).json({ error: 'A valid investigation context is required.' });
    }
    return res.json(await runProviderAnalysis(providerId, context, role || 'Architect'));
  } catch (err: any) {
    console.error('Error handling /api/ai/analyze:', err);
    const status = err?.message?.includes('Firebase ID token') ? 401 : 502;
    return res.status(status).json({ error: err?.message || 'AI provider error' });
  }
});

/**
 * Runs the independent panel from authoritative Firestore state and persists
 * each completed agent result as messages, claims, and draft experiments.
 *
 * No new top-level collection is introduced: all writes stay inside the
 * canonical investigation subcollections.
 */
aiRouter.post('/independent-panel', async (req: Request, res: Response) => {
  try {
    const user = await requireFirebaseUser(req);
    const { orgId, roomId, invId, providerIds, panelRunId } = req.body as {
      orgId?: unknown;
      roomId?: unknown;
      invId?: unknown;
      providerIds?: unknown;
      panelRunId?: unknown;
    };

    if (![orgId, roomId, invId, panelRunId].every(isString)) {
      return res.status(400).json({ error: 'orgId, roomId, invId and panelRunId are required.' });
    }

    const requested = Array.isArray(providerIds)
      ? providerIds.filter(isProviderId)
      : (['gemini', 'openai', 'anthropic', 'deepseek'] as AIProviderId[]);

    if (requested.length === 0) return res.status(400).json({ error: 'At least one valid provider is required.' });

    const state = await loadInvestigationState(orgId, roomId, invId);
    if (state.orgSnap.data()?.ownerId !== user.uid) {
      return res.status(403).json({ error: 'Organization access denied.' });
    }

    const built = await buildServerContext(orgId, roomId, invId);
    const results = await Promise.all(requested.map(async (providerId) => {
      const role: AgentRole = 'Independent Analyst';
      try {
        const result = await runProviderAnalysis(providerId, built.context, role);
        return { providerId, role, status: 'completed' as const, result };
      } catch (error) {
        return {
          providerId,
          role,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }));

    const successful = results.filter((r) => r.status === 'completed' && r.result);
    if (successful.length === 0) {
      return res.status(502).json({ panelRunId, results });
    }

    const db = state.db;
    const batch = db.batch();
    const claimRefs = new Map<string, DocumentReference>();
    const claimData = new Map<string, Claim>();
    const claimUpdates = new Map<string, { ref: DocumentReference; challenges: any[]; experimentIds: string[] }>();

    // Existing claims are authoritative candidates for challenge matching.
    for (const claim of built.claims) {
      const key = claim.statement.trim().toLowerCase();
      const ref = state.invRef.collection('claims').doc(claim.id);
      claimRefs.set(key, ref);
      claimData.set(key, claim);
    }

    const now = new Date().toISOString();

    for (const item of successful) {
      const result = item.result!;
      const messageId = stableId('agent', `${panelRunId}:${item.providerId}`);
      const messageRef = state.invRef.collection('messages').doc(messageId);
      const message: InvestigationMessage = {
        id: messageId,
        organizationId: orgId,
        roomId,
        investigationId: invId,
        sender: {
          id: `agent-${item.providerId}`,
          name: item.providerId,
          role: item.role,
          type: 'agent',
          provider: item.providerId,
        },
        content: result.analysisText,
        timestamp: now,
      };
      batch.set(messageRef, message, { merge: false });

      for (const draft of result.proposedClaims) {
        const key = draft.statement.trim().toLowerCase();
        if (!key) continue;

        let claimRef = claimRefs.get(key);
        if (!claimRef) {
          claimRef = state.invRef.collection('claims').doc(stableId('claim', key));
          claimRefs.set(key, claimRef);

          const claim: Claim = {
            id: claimRef.id,
            organizationId: orgId,
            roomId,
            investigationId: invId,
            statement: draft.statement.trim(),
            status: 'unverified',
            importance: draft.importance,
            createdBy: {
              id: `agent-${item.providerId}`,
              name: item.providerId,
              type: 'agent',
              provider: item.providerId,
              role: item.role,
            },
            arguments: [{
              id: stableId('arg', `${item.providerId}:${key}`),
              author: item.providerId,
              role: item.role,
              text: draft.rationale,
              type: 'pro',
              timestamp: now,
            }],
            challenges: [],
            relatedEvidenceIds: [],
            relatedExperimentIds: [],
            createdAt: now,
            updatedAt: now,
          };
          claimData.set(key, claim);
          batch.set(claimRef, claim);
        }
      }

      for (const challenge of result.counterChallenges) {
        const key = challenge.targetClaimStatement.trim().toLowerCase();
        const claimRef = claimRefs.get(key);
        if (!claimRef) continue;

        const current = claimUpdates.get(claimRef.path) || { ref: claimRef, challenges: [], experimentIds: [] };
        current.challenges.push({
          id: stableId('ch', `${panelRunId}:${item.providerId}:${key}`),
          challenger: item.providerId,
          role: item.role,
          challenge: challenge.challenge,
          timestamp: now,
        });
        claimUpdates.set(claimRef.path, current);
      }

      for (const suggestion of result.recommendedExperiments) {
        const targetKey = suggestion.targetClaimStatement?.trim().toLowerCase();
        const relatedClaim = targetKey ? claimRefs.get(targetKey) : undefined;
        const expId = stableId('exp', `${panelRunId}:${item.providerId}:${suggestion.title}:${suggestion.commandOrProcedure}`);
        const expRef = state.invRef.collection('experiments').doc(expId);
        const experiment: Experiment = {
          id: expId,
          organizationId: orgId,
          roomId,
          investigationId: invId,
          title: suggestion.title,
          objective: suggestion.objective,
          status: 'draft',
          environment: built.investigation.environment,
          commandOrProcedure: suggestion.commandOrProcedure,
          expectedResult: suggestion.expectedResult,
          outcome: 'not_run',
          relatedClaimIds: relatedClaim ? [relatedClaim.id] : [],
          artifacts: [],
          createdAt: now,
          updatedAt: now,
        };
        batch.set(expRef, experiment, { merge: false });

        if (relatedClaim) {
          const current = claimUpdates.get(relatedClaim.path) || { ref: relatedClaim, challenges: [], experimentIds: [] };
          current.experimentIds.push(expId);
          claimUpdates.set(relatedClaim.path, current);
        }
      }
    }

    for (const update of claimUpdates.values()) {
      const data: Record<string, unknown> = { updatedAt: now };
      if (update.challenges.length) {
        data.challenges = FieldValue.arrayUnion(...update.challenges);
        data.status = 'disputed';
      }
      if (update.experimentIds.length) {
        data.relatedExperimentIds = FieldValue.arrayUnion(...update.experimentIds);
      }
      batch.update(update.ref, data);
    }

    batch.update(state.invRef, {
      participatingAgents: FieldValue.arrayUnion(...successful.map((r) => r.providerId)),
      updatedAt: now,
    });

    await batch.commit();
    return res.json({ panelRunId, results, persistedProviders: successful.map((r) => r.providerId) });
  } catch (err: any) {
    console.error('Error handling /api/ai/independent-panel:', err);
    const status = err?.message?.includes('Firebase ID token') ? 401 : 500;
    return res.status(status).json({ error: err?.message || 'Independent panel failed.' });
  }
});

aiRouter.get('/providers', async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    return res.json({ providers: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    }});
  } catch (err: any) {
    return res.status(401).json({ error: err?.message || 'Authentication required' });
  }
});

aiRouter.post('/challenge', async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    const { claimStatement } = req.body;
    if (!claimStatement || typeof claimStatement !== 'string') {
      return res.status(400).json({ error: 'claimStatement is required.' });
    }
    return res.status(501).json({ error: 'Challenge generation is not yet implemented as a trusted provider operation.' });
  } catch (err: any) {
    const status = err?.message?.includes('Firebase ID token') ? 401 : 500;
    return res.status(status).json({ error: err?.message || 'Internal AI challenge error' });
  }
});

import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { requireFirebaseUser } from './auth';
import { ClaimManager } from '../src/orchestrator/claim-manager';
import { InvestigationManager } from '../src/orchestrator/investigation-manager';
import type { Claim, Evidence, Experiment, Investigation, InvestigationMessage } from '../src/types';

export const epistemicRouter = Router();

epistemicRouter.post('/reconcile-claim', async (req, res) => {
  try {
    const { orgId, roomId, invId, claimId } = req.body ?? {};
    if (![orgId, roomId, invId, claimId].every((value) => typeof value === 'string' && value.length > 0)) {
      return res.status(400).json({ error: 'orgId, roomId, invId and claimId are required.' });
    }

    const user = await requireFirebaseUser(req);
    const db = getAdminDb();
    const orgSnap = await db.doc(`organizations/${orgId}`).get();
    if (!orgSnap.exists || orgSnap.data()?.ownerId !== user.uid) {
      return res.status(403).json({ error: 'Not authorized for this organization.' });
    }

    const base = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}`;
    const claimRef = db.doc(`${base}/claims/${claimId}`);

    let result: { status: Claim['status']; rationale: string } | null = null;
    await db.runTransaction(async (tx) => {
      const claimSnap = await tx.get(claimRef);
      if (!claimSnap.exists) throw new Error('Claim not found.');

      const [evidenceSnap, experimentSnap] = await Promise.all([
        tx.get(db.collection(`${base}/evidence`)),
        tx.get(db.collection(`${base}/experiments`)),
      ]);

      const claim = { id: claimSnap.id, ...claimSnap.data() } as Claim;
      const evidence = evidenceSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Evidence)
        .filter((item) => claim.relatedEvidenceIds.includes(item.id));
      const experiments = experimentSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Experiment)
        .filter((item) => claim.relatedExperimentIds.includes(item.id));

      const evaluation = ClaimManager.evaluateStatus(claim, evidence, experiments);
      result = {
        status: evaluation.recommendedStatus,
        rationale: evaluation.rationale,
      };

      tx.update(claimRef, {
        status: evaluation.recommendedStatus,
        epistemicRationale: evaluation.rationale,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.json({ claimId, status: result!.status, recommendedStatus: result!.status, rationale: result!.rationale });
  } catch (error) {
    console.error('Epistemic reconciliation failed:', error);
    const message = error instanceof Error ? error.message : 'Reconciliation failed.';
    if (message === 'Claim not found.') return res.status(404).json({ error: message });
    return res.status(500).json({ error: message });
  }
});


epistemicRouter.post('/reconcile', async (req, res) => {
  try {
    const { orgId, roomId, invId, runId } = req.body ?? {};
    if (![orgId, roomId, invId, runId].every((value) => typeof value === 'string' && value.length > 0)) {
      return res.status(400).json({ error: 'orgId, roomId, invId and runId are required.' });
    }

    const user = await requireFirebaseUser(req);
    const db = getAdminDb();
    const orgSnap = await db.doc('organizations/' + orgId).get();
    if (!orgSnap.exists || orgSnap.data()?.ownerId !== user.uid) {
      return res.status(403).json({ error: 'Not authorized for this organization.' });
    }

    const base = 'organizations/' + orgId + '/rooms/' + roomId + '/investigations/' + invId;
    const investigationRef = db.doc(base);
    let payload: {
      runId: string;
      changes: Array<{ claimId: string; oldStatus: Claim['status']; newStatus: Claim['status']; rationale: string }>;
      nextPhase: Investigation['phase'];
      phaseChanged: boolean;
    } | null = null;

    await db.runTransaction(async (tx) => {
      const [investigationSnap, claimsSnap, evidenceSnap, experimentSnap] = await Promise.all([
        tx.get(investigationRef),
        tx.get(db.collection(base + '/claims')),
        tx.get(db.collection(base + '/evidence')),
        tx.get(db.collection(base + '/experiments')),
      ]);

      if (!investigationSnap.exists) throw new Error('Investigation not found.');

      const investigation = { id: investigationSnap.id, ...investigationSnap.data() } as Investigation;
      const claims = claimsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Claim);
      const evidence = evidenceSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Evidence);
      const experiments = experimentSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Experiment);

      const changes = claims.map((claim) => {
        const attachedEvidence = evidence.filter((e) => claim.relatedEvidenceIds.includes(e.id));
        const attachedExperiments = experiments.filter((e) => claim.relatedExperimentIds.includes(e.id));
        const evaluation = ClaimManager.evaluateStatus(claim, attachedEvidence, attachedExperiments);
        return {
          claimId: claim.id,
          oldStatus: claim.status,
          newStatus: evaluation.recommendedStatus,
          rationale: evaluation.rationale,
        };
      });

      for (const change of changes) {
        tx.update(db.doc(base + '/claims/' + change.claimId), {
          status: change.newStatus,
          epistemicRationale: change.rationale,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      const reconciledClaims = claims.map((claim) => {
        const change = changes.find((item) => item.claimId === claim.id)!;
        return { ...claim, status: change.newStatus };
      });

      const unresolved = reconciledClaims.filter((claim) =>
        claim.status === 'unverified' || claim.status === 'unknown' || claim.status === 'disputed'
      );
      const disproved = reconciledClaims.filter((claim) => claim.status === 'disproved');
      const hasRunnableExperiment = experiments.some((experiment) =>
        experiment.outcome === 'not_run' && (experiment.status === 'draft' || experiment.status === 'ready')
      );

      const recommendedPhase: Investigation['phase'] =
        claims.length > 0 && unresolved.length === 0 && disproved.length === 0
          ? 'decision'
          : hasRunnableExperiment
            ? 'experiment'
            : 'evidence';

      let nextPhase = investigation.phase;
      let phaseChanged = false;
      if (investigation.phase === 'reconciliation') {
        InvestigationManager.assertTransition(investigation.phase, recommendedPhase);
        nextPhase = recommendedPhase;
        phaseChanged = recommendedPhase !== investigation.phase;
        if (phaseChanged) {
          tx.update(investigationRef, {
            phase: recommendedPhase,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      const changed = changes.filter((item) => item.oldStatus !== item.newStatus);
      const messageId = 'reconcile-' + runId;
      const message: InvestigationMessage = {
        id: messageId,
        organizationId: orgId,
        roomId,
        investigationId: invId,
        sender: {
          id: 'system-reconciliation',
          name: 'Reconciliation Engine',
          role: 'Architect',
          type: 'agent',
        },
        content: [
          'Reconciliation run ' + runId + ' completed.',
          'Claims evaluated: ' + claims.length + '; status changes: ' + changed.length + '.',
          changed.length
            ? changed.map((item) => '- ' + item.claimId + ': ' + item.oldStatus + ' -> ' + item.newStatus + ' (' + item.rationale + ')').join('\n')
            : 'No claim status changes were required.',
          'Recommended next phase: ' + recommendedPhase + '.',
        ].join('\n'),
        associatedClaimIds: claims.map((claim) => claim.id),
        timestamp: new Date().toISOString(),
      };
      tx.set(db.doc(base + '/messages/' + messageId), message, { merge: true });

      payload = { runId, changes, nextPhase, phaseChanged };
    });

    return res.json(payload);
  } catch (error) {
    console.error('Investigation reconciliation failed:', error);
    const message = error instanceof Error ? error.message : 'Investigation reconciliation failed.';
    if (message === 'Investigation not found.') return res.status(404).json({ error: message });
    if (message.startsWith('Invalid investigation phase transition:')) return res.status(409).json({ error: message });
    return res.status(500).json({ error: message });
  }
});

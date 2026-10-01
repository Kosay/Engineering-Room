import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { requireFirebaseUser } from './auth';
import { DecisionManager } from '../src/orchestrator/decision-manager';
import type { Claim, Decision, Evidence, Experiment } from '../src/types';

export const decisionRouter = Router();

decisionRouter.post('/approve', async (req, res) => {
  try {
    const { orgId, roomId, invId, decisionId } = req.body ?? {};
    if (![orgId, roomId, invId, decisionId].every((value) => typeof value === 'string' && value.length > 0)) {
      return res.status(400).json({ error: 'orgId, roomId, invId and decisionId are required.' });
    }

    const user = await requireFirebaseUser(req);
    const db = getAdminDb();
    const orgSnap = await db.doc(`organizations/${orgId}`).get();
    if (!orgSnap.exists || orgSnap.data()?.ownerId !== user.uid) {
      return res.status(403).json({ error: 'Not authorized for this organization.' });
    }

    const base = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}`;
    const decisionRef = db.doc(`${base}/decisions/${decisionId}`);

    await db.runTransaction(async (tx) => {
      const decisionSnap = await tx.get(decisionRef);
      if (!decisionSnap.exists) throw new Error('Decision not found.');

      const [claimsSnap, evidenceSnap, experimentSnap] = await Promise.all([
        tx.get(db.collection(`${base}/claims`)),
        tx.get(db.collection(`${base}/evidence`)),
        tx.get(db.collection(`${base}/experiments`)),
      ]);

      const decision = { id: decisionSnap.id, ...decisionSnap.data() } as Decision;
      if (decision.status === 'approved') {
        throw new Error('Decision is already approved.');
      }

      const claims = claimsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Claim);
      const evidence = evidenceSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Evidence);
      const experiments = experimentSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Experiment);

      const readiness = DecisionManager.evaluateDecisionReadiness(
        decision,
        claims,
        evidence,
        experiments
      );

      if (!readiness.isReadyForApproval) {
        const error = new Error('Decision is not ready for approval.');
        (error as Error & { blockers?: string[]; warnings?: string[] }).blockers = readiness.blockers;
        (error as Error & { blockers?: string[]; warnings?: string[] }).warnings = readiness.warnings;
        throw error;
      }

      tx.update(decisionRef, {
        status: 'approved',
        approvedBy: user.displayName || user.email || user.uid,
        approvedAt: new Date().toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.json({ decisionId, status: 'approved' });
  } catch (error) {
    console.error('Decision approval failed:', error);
    const typed = error as Error & { blockers?: string[]; warnings?: string[] };
    if (typed.message === 'Decision not found.') return res.status(404).json({ error: typed.message });
    if (typed.message === 'Decision is already approved.') return res.status(409).json({ error: typed.message });
    if (typed.message === 'Decision is not ready for approval.') {
      return res.status(409).json({ error: typed.message, blockers: typed.blockers ?? [], warnings: typed.warnings ?? [] });
    }
    return res.status(500).json({ error: typed.message || 'Decision approval failed.' });
  }
});

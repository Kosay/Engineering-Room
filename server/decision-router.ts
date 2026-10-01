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
    const [decisionSnap, claimsSnap, evidenceSnap, experimentSnap] = await Promise.all([
      decisionRef.get(),
      db.collection(`${base}/claims`).get(),
      db.collection(`${base}/evidence`).get(),
      db.collection(`${base}/experiments`).get(),
    ]);

    if (!decisionSnap.exists) return res.status(404).json({ error: 'Decision not found.' });

    const decision = { id: decisionSnap.id, ...decisionSnap.data() } as Decision;
    if (decision.status === 'approved') {
      return res.status(409).json({ error: 'Decision is already approved.' });
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
      return res.status(409).json({
        error: 'Decision is not ready for approval.',
        blockers: readiness.blockers,
        warnings: readiness.warnings,
      });
    }

    await decisionRef.update({
      status: 'approved',
      approvedBy: user.displayName || user.email || user.uid,
      approvedAt: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ decisionId, status: 'approved' });
  } catch (error) {
    console.error('Decision approval failed:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Decision approval failed.' });
  }
});

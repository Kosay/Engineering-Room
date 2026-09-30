import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { requireFirebaseUser } from './auth';
import { ClaimManager } from '../src/orchestrator/claim-manager';
import type { Claim, Evidence, Experiment } from '../src/types';

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
    const [claimSnap, evidenceSnap, experimentSnap] = await Promise.all([
      claimRef.get(),
      db.collection(`${base}/evidence`).get(),
      db.collection(`${base}/experiments`).get(),
    ]);

    if (!claimSnap.exists) return res.status(404).json({ error: 'Claim not found.' });

    const claim = { id: claimSnap.id, ...claimSnap.data() } as Claim;
    const evidence = evidenceSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Evidence)
      .filter((item) => claim.relatedEvidenceIds.includes(item.id));
    const experiments = experimentSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Experiment)
      .filter((item) => claim.relatedExperimentIds.includes(item.id));

    const evaluation = ClaimManager.evaluateStatus(claim, evidence, experiments);

    await claimRef.update({
      status: evaluation.recommendedStatus,
      epistemicRationale: evaluation.rationale,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ claimId, status: evaluation.recommendedStatus, rationale: evaluation.rationale });
  } catch (error) {
    console.error('Epistemic reconciliation failed:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Reconciliation failed.' });
  }
});

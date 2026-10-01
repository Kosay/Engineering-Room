import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { requireFirebaseUser } from './auth';

export const claimRouter = Router();

claimRouter.post('/challenge', async (req, res) => {
  try {
    const { orgId, roomId, invId, claimId, challenge } = req.body ?? {};

    if (![orgId, roomId, invId, claimId].every(
      (value) => typeof value === 'string' && value.length > 0
    )) {
      return res.status(400).json({
        error: 'orgId, roomId, invId and claimId are required.',
      });
    }

    if (!challenge || typeof challenge !== 'object') {
      return res.status(400).json({ error: 'Challenge is required.' });
    }

    if (
      typeof challenge.challenger !== 'string' ||
      typeof challenge.role !== 'string' ||
      typeof challenge.challenge !== 'string' ||
      challenge.challenge.trim().length < 3
    ) {
      return res.status(400).json({ error: 'A substantive challenge is required.' });
    }

    const user = await requireFirebaseUser(req);
    const db = getAdminDb();
    const orgSnap = await db.doc(`organizations/${orgId}`).get();

    if (!orgSnap.exists || orgSnap.data()?.ownerId !== user.uid) {
      return res.status(403).json({ error: 'Not authorized for this organization.' });
    }

    const claimRef = db.doc(
      `organizations/${orgId}/rooms/${roomId}/investigations/${invId}/claims/${claimId}`
    );

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(claimRef);
      if (!snap.exists) throw new Error('Claim not found.');

      const current = snap.data() ?? {};
      const challenges = Array.isArray(current.challenges) ? current.challenges : [];

      tx.update(claimRef, {
        challenges: [
          ...challenges,
          {
            id: `ch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            challenger: challenge.challenger.trim(),
            role: challenge.role,
            challenge: challenge.challenge.trim(),
            timestamp: new Date().toISOString(),
          },
        ],
        status: 'disputed',
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.json({ claimId, status: 'disputed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Claim challenge failed.';
    console.error('Claim challenge failed:', error);
    if (message === 'Claim not found.') return res.status(404).json({ error: message });
    return res.status(500).json({ error: message });
  }
});

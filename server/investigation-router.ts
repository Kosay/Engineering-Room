import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { requireFirebaseUser } from './auth';
import { InvestigationManager } from '../src/orchestrator/investigation-manager';
import type { Investigation, InvestigationPhase } from '../src/types';

const PHASES: InvestigationPhase[] = [
  'question',
  'analysis',
  'debate',
  'evidence',
  'experiment',
  'reconciliation',
  'decision',
  'implementation',
  'completed',
];

export const investigationRouter = Router();

investigationRouter.post('/transition-phase', async (req, res) => {
  try {
    const { orgId, roomId, invId, phase } = req.body ?? {};

    if (![orgId, roomId, invId, phase].every(
      (value) => typeof value === 'string' && value.length > 0
    )) {
      return res.status(400).json({ error: 'orgId, roomId, invId and phase are required.' });
    }

    if (!PHASES.includes(phase as InvestigationPhase)) {
      return res.status(400).json({ error: 'Invalid investigation phase.' });
    }

    const user = await requireFirebaseUser(req);
    const db = getAdminDb();
    const orgSnap = await db.doc(`organizations/${orgId}`).get();

    if (!orgSnap.exists || orgSnap.data()?.ownerId !== user.uid) {
      return res.status(403).json({ error: 'Not authorized for this organization.' });
    }

    const investigationRef = db.doc(
      `organizations/${orgId}/rooms/${roomId}/investigations/${invId}`
    );

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(investigationRef);
      if (!snap.exists) throw new Error('Investigation not found.');

      const investigation = { id: snap.id, ...snap.data() } as Investigation;
      InvestigationManager.assertTransition(
        investigation.phase,
        phase as InvestigationPhase
      );

      tx.update(investigationRef, {
        phase,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.json({ invId, phase });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Phase transition failed.';
    console.error('Investigation phase transition failed:', error);

    if (message === 'Investigation not found.') {
      return res.status(404).json({ error: message });
    }
    if (message.startsWith('Invalid investigation phase transition:')) {
      return res.status(409).json({ error: message });
    }
    return res.status(500).json({ error: message });
  }
});

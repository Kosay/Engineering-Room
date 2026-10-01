import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import { requireFirebaseUser } from './auth';
import type { Experiment, ExperimentArtifact, ExperimentOutcome } from '../src/types';

const RECORDABLE_OUTCOMES: ExperimentOutcome[] = [
  'passed',
  'failed',
  'partial',
  'inconclusive',
];

export const experimentRouter = Router();

experimentRouter.post('/record-result', async (req, res) => {
  try {
    const { orgId, roomId, invId, expId, result } = req.body ?? {};

    if (![orgId, roomId, invId, expId].every(
      (value) => typeof value === 'string' && value.length > 0
    )) {
      return res.status(400).json({
        error: 'orgId, roomId, invId and expId are required.',
      });
    }

    if (!result || typeof result !== 'object') {
      return res.status(400).json({ error: 'Experiment result is required.' });
    }

    const outcome = result.outcome as ExperimentOutcome;
    if (!RECORDABLE_OUTCOMES.includes(outcome)) {
      return res.status(400).json({ error: 'Invalid experiment outcome.' });
    }

    if (typeof result.actualResult !== 'string' || result.actualResult.trim().length < 10) {
      return res.status(400).json({
        error: 'A substantive actualResult is required to record an experiment result.',
      });
    }

    if (typeof result.executedBy !== 'string' || result.executedBy.trim().length === 0) {
      return res.status(400).json({ error: 'executedBy is required.' });
    }

    if (!Array.isArray(result.artifacts)) {
      return res.status(400).json({ error: 'artifacts must be an array.' });
    }

    const user = await requireFirebaseUser(req);
    const db = getAdminDb();
    const orgSnap = await db.doc(`organizations/${orgId}`).get();
    if (!orgSnap.exists || orgSnap.data()?.ownerId !== user.uid) {
      return res.status(403).json({ error: 'Not authorized for this organization.' });
    }

    const base = `organizations/${orgId}/rooms/${roomId}/investigations/${invId}`;
    const experimentRef = db.doc(`${base}/experiments/${expId}`);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(experimentRef);
      if (!snap.exists) throw new Error('Experiment not found.');

      const experiment = { id: snap.id, ...snap.data() } as Experiment;
      if (experiment.status === 'abandoned') {
        throw new Error('Abandoned experiments cannot receive results.');
      }
      if (experiment.status === 'completed') {
        throw new Error('Experiment result is already recorded.');
      }

      const artifacts = result.artifacts as ExperimentArtifact[];
      tx.update(experimentRef, {
        status: 'completed',
        outcome,
        actualResult: result.actualResult.trim(),
        executedBy: result.executedBy.trim(),
        executionTimestamp: new Date().toISOString(),
        artifacts,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return res.json({ expId, status: 'completed', outcome });
  } catch (error) {
    console.error('Experiment result recording failed:', error);
    const message = error instanceof Error ? error.message : 'Experiment result recording failed.';
    const status = /not found|already recorded|abandoned/i.test(message) ? 409 : 500;
    return res.status(status).json({ error: message });
  }
});

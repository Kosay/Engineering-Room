/**
 * Server API Router for AI operations.
 * All AI calls require an authenticated Firebase user so provider credentials
 * cannot be abused through an unauthenticated public endpoint.
 */

import { Router, Request, Response } from 'express';
import { processInvestigationAnalysis } from './gemini-service';
import { requireFirebaseUser } from './auth';

export const aiRouter = Router();

aiRouter.post(['/analyze', '/agent-turn'], async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    const { role, context } = req.body;
    const result = await processInvestigationAnalysis({ role: role || 'Architect', context });

    if (result) return res.json(result);

    return res.status(503).json({
      error: 'Gemini provider is unavailable. Configure GEMINI_API_KEY and retry.',
    });
  } catch (err: any) {
    console.error('Error handling /api/ai/analyze:', err);
    const status = err?.message?.includes('Firebase ID token') ? 401 : 500;
    return res.status(status).json({ error: err?.message || 'Internal AI processing error' });
  }
});

aiRouter.post('/challenge', async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    const { claimStatement } = req.body;
    if (!claimStatement || typeof claimStatement !== 'string') {
      return res.status(400).json({ error: 'claimStatement is required.' });
    }
    return res.status(501).json({
      error: 'Gemini challenge generation is not implemented yet.',
    });
  } catch (err: any) {
    console.error('Error handling /api/ai/challenge:', err);
    const status = err?.message?.includes('Firebase ID token') ? 401 : 500;
    return res.status(status).json({ error: err?.message || 'Internal AI challenge error' });
  }
});

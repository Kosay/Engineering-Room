/**
 * Server API Router for AI operations
 * Kept strictly server-side so API keys are never leaked to the browser.
 */

import { Router, Request, Response } from 'express';
import { processInvestigationAnalysis } from './gemini-service';

export const aiRouter = Router();

aiRouter.post(['/analyze', '/agent-turn'], async (req: Request, res: Response) => {
  try {
    const { role, context } = req.body;
    const result = await processInvestigationAnalysis({ role: role || 'Architect', context });

    if (result) {
      return res.json(result);
    }

    return res.status(503).json({
      error: 'Gemini provider is unavailable. Configure GEMINI_API_KEY and retry.',
    });
  } catch (err: any) {
    console.error('Error handling /api/ai/analyze:', err);
    return res.status(500).json({ error: err?.message || 'Internal AI processing error' });
  }
});

aiRouter.post('/challenge', async (req: Request, res: Response) => {
  try {
    if (!claimStatement || typeof claimStatement !== 'string') {
      return res.status(400).json({ error: 'claimStatement is required.' });
    }
    return res.status(501).json({
      error: 'Gemini challenge generation is not implemented yet.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal AI challenge error' });
  }
});

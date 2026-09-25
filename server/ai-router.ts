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
    const { claimStatement } = req.body;
    return res.json({
      challengeText: `Adversarial Check on "${claimStatement}": Have we verified whether the target process (e.g. wps.exe / kso.exe) runs under an elevated or restricted UAC token, or if COM registration keys in HKCR\\Word.Application differ from Microsoft Office?`,
      proposingCounterClaims: [
        {
          statement: `WPS Office COM ProgID may be Kwps.Application instead of Word.Application depending on installed version and registry config.`,
          importance: 'high',
          initialStatus: 'unverified',
          rationale: 'Kingsoft WPS historically registers both compatibility aliases and native Kwps ProgIDs. Discrepancies often fail Marshal.GetActiveObject.',
        },
      ],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal AI challenge error' });
  }
});

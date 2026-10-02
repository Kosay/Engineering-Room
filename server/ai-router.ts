import { Router, Request, Response } from 'express';
import { requireFirebaseUser } from './auth';
import { runProviderAnalysis } from './ai-provider-gateway';
import { AgentRole, AIProviderId } from '../src/types';
import { InvestigationContext } from '../src/providers/ai-provider.interface';

export const aiRouter = Router();

function isProviderId(value: unknown): value is AIProviderId {
  return value === 'gemini' || value === 'openai' || value === 'anthropic' || value === 'deepseek';
}

aiRouter.post(['/analyze', '/agent-turn'], async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    const { providerId = 'gemini', role = 'Architect', context } = req.body as {
      providerId?: unknown; role?: AgentRole; context?: InvestigationContext;
    };
    if (!isProviderId(providerId)) return res.status(400).json({ error: 'Invalid providerId.' });
    if (!context || typeof context.question !== 'string') {
      return res.status(400).json({ error: 'A valid investigation context is required.' });
    }
    return res.json(await runProviderAnalysis(providerId, context, role || 'Architect'));
  } catch (err: any) {
    console.error('Error handling /api/ai/analyze:', err);
    const status = err?.message?.includes('Firebase ID token') ? 401 : 502;
    return res.status(status).json({ error: err?.message || 'AI provider error' });
  }
});

aiRouter.get('/providers', async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    return res.json({ providers: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    }});
  } catch (err: any) {
    return res.status(401).json({ error: err?.message || 'Authentication required' });
  }
});

aiRouter.post('/challenge', async (req: Request, res: Response) => {
  try {
    await requireFirebaseUser(req);
    const { claimStatement } = req.body;
    if (!claimStatement || typeof claimStatement !== 'string') {
      return res.status(400).json({ error: 'claimStatement is required.' });
    }
    return res.status(501).json({ error: 'Challenge generation is not yet implemented as a trusted provider operation.' });
  } catch (err: any) {
    const status = err?.message?.includes('Firebase ID token') ? 401 : 500;
    return res.status(status).json({ error: err?.message || 'Internal AI challenge error' });
  }
});

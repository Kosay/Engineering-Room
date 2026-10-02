import test from 'node:test';
import assert from 'node:assert/strict';
import { runProviderAnalysis } from '../server/ai-provider-gateway';
import type { InvestigationContext } from '../src/providers/ai-provider.interface';

const context: InvestigationContext = {
  title: 'Provider gateway test',
  question: 'Does the gateway reject an unconfigured provider without making a network call?',
  environment: 'CI',
  phase: 'analysis',
  existingClaims: [],
  existingEvidence: [],
  existingExperiments: [],
};

test('missing OpenAI credentials produce an explicit provider failure', async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    await assert.rejects(
      runProviderAnalysis('openai', context, 'Independent Analyst'),
      /OPENAI_API_KEY/
    );
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
});

test('missing Anthropic credentials produce an explicit provider failure', async () => {
  const previous = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    await assert.rejects(
      runProviderAnalysis('anthropic', context, 'Adversarial Reviewer'),
      /ANTHROPIC_API_KEY/
    );
  } finally {
    if (previous === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = previous;
  }
});

test('missing DeepSeek credentials produce an explicit provider failure', async () => {
  const previous = process.env.DEEPSEEK_API_KEY;
  delete process.env.DEEPSEEK_API_KEY;
  try {
    await assert.rejects(
      runProviderAnalysis('deepseek', context, 'Independent Analyst'),
      /DEEPSEEK_API_KEY/
    );
  } finally {
    if (previous === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = previous;
  }
});

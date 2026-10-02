import { AgentRole } from '../src/types';
import { InvestigationContext, ProviderAnalysisResult } from '../src/providers/ai-provider.interface';

const SYSTEM_PROMPT = `You are a Principal Systems Engineer and {{ROLE}} in the KMH AI Engineering Room.
The purpose of this room is to verify technical claims through empirical evidence and reproducible experiments.
AI reasoning is not evidence. Every proposed claim must remain unverified until evidence or a conclusive experiment supports it.
Do not invent sources, test results, APIs, versions, or environment facts.
Return ONLY valid JSON with exactly these top-level fields:
{
  "analysisText": "engineering analysis",
  "proposedClaims": [{"statement":"falsifiable claim","importance":"critical|high|medium|low","initialStatus":"unverified","rationale":"why it matters"}],
  "counterChallenges": [{"targetClaimStatement":"claim","challenge":"specific challenge","counterHypothesis":"alternative explanation"}],
  "recommendedExperiments": [{"title":"test","objective":"what it proves","commandOrProcedure":"reproducible procedure","expectedResult":"expected observation"}]
}`;

function buildPrompt(context: InvestigationContext, role: AgentRole): string {
  return SYSTEM_PROMPT.replace('{{ROLE}}', role) + '\n\n' +
    JSON.stringify({
      engineeringQuestion: context.question,
      title: context.title,
      environment: context.environment,
      phase: context.phase,
      existingClaims: context.existingClaims,
      existingEvidence: context.existingEvidence,
      existingExperiments: context.existingExperiments,
    }, null, 2);
}

function parseResult(text: string, providerId: ProviderAnalysisResult['providerId'], role: AgentRole): ProviderAnalysisResult {
  const cleaned = text.trim().replace(/^\`\`\`json\s*/i, '').replace(/\s*\`\`\`$/i, '');
  const parsed = JSON.parse(cleaned);
  return {
    providerId,
    agentRole: role,
    analysisText: parsed.analysisText || '',
    proposedClaims: Array.isArray(parsed.proposedClaims) ? parsed.proposedClaims : [],
    counterChallenges: Array.isArray(parsed.counterChallenges) ? parsed.counterChallenges : [],
    recommendedExperiments: Array.isArray(parsed.recommendedExperiments) ? parsed.recommendedExperiments : [],
    rawTimestamp: new Date().toISOString(),
  };
}

async function postJson(url: string, headers: Record<string,string>, body: unknown): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`Provider request failed (${response.status}): ${raw.slice(0, 500)}`);
  try { return JSON.parse(raw); } catch { throw new Error('Provider returned invalid JSON.'); }
}

export async function runProviderAnalysis(
  providerId: ProviderAnalysisResult['providerId'],
  context: InvestigationContext,
  role: AgentRole,
): Promise<ProviderAnalysisResult> {
  const prompt = buildPrompt(context, role);

  if (providerId === 'gemini') {
    const { processInvestigationAnalysis } = await import('./gemini-service');
    const result = await processInvestigationAnalysis({
      role,
      context: {
        title: context.title,
        question: context.question,
        environment: context.environment,
        existingClaims: context.existingClaims,
        existingEvidence: context.existingEvidence,
        existingExperiments: context.existingExperiments,
      },
    });
    if (!result) throw new Error('Gemini provider is unavailable. Configure GEMINI_API_KEY.');
    return result as ProviderAnalysisResult;
  }

  if (providerId === 'openai') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OpenAI provider is unavailable. Configure OPENAI_API_KEY.');
    const model = process.env.OPENAI_MODEL || 'gpt-5';
    const data = await postJson('https://api.openai.com/v1/responses', {
      Authorization: `Bearer ${key}`,
    }, {
      model,
      input: prompt,
      text: { format: { type: 'json_object' } },
    });
    const output = typeof data.output_text === 'string'
      ? data.output_text
      : (data.output || []).flatMap((x: any) => x.content || []).map((x: any) => x.text || '').join('');
    return parseResult(output, 'openai', role);
  }

  if (providerId === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('Anthropic provider is unavailable. Configure ANTHROPIC_API_KEY.');
    const model = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
    const data = await postJson('https://api.anthropic.com/v1/messages', {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    }, {
      model,
      max_tokens: 8192,
      system: SYSTEM_PROMPT.replace('{{ROLE}}', role),
      messages: [{ role: 'user', content: JSON.stringify({
        engineeringQuestion: context.question,
        title: context.title,
        environment: context.environment,
        phase: context.phase,
        existingClaims: context.existingClaims,
        existingEvidence: context.existingEvidence,
        existingExperiments: context.existingExperiments,
      }, null, 2) }],
    });
    const output = (data.content || []).filter((x: any) => x.type === 'text').map((x: any) => x.text).join('');
    return parseResult(output, 'anthropic', role);
  }

  if (providerId === 'deepseek') {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error('DeepSeek provider is unavailable. Configure DEEPSEEK_API_KEY.');
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-pro';
    const data = await postJson('https://api.deepseek.com/chat/completions', {
      Authorization: `Bearer ${key}`,
    }, {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT.replace('{{ROLE}}', role) },
        { role: 'user', content: JSON.stringify({
          engineeringQuestion: context.question,
          title: context.title,
          environment: context.environment,
          phase: context.phase,
          existingClaims: context.existingClaims,
          existingEvidence: context.existingEvidence,
          existingExperiments: context.existingExperiments,
        }, null, 2) },
      ],
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
      response_format: { type: 'json_object' },
      stream: false,
    });
    const output = data.choices?.[0]?.message?.content;
    if (!output) throw new Error('DeepSeek returned no message content.');
    return parseResult(output, 'deepseek', role);
  }

  throw new Error(`Unsupported provider: ${providerId}`);
}

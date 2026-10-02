import { AgentRole, AIProviderId } from '../types';
import { AIProvider, ClaimDraft, InvestigationContext, ProviderAnalysisResult } from './ai-provider.interface';

async function callGateway(context: InvestigationContext, role: AgentRole): Promise<ProviderAnalysisResult> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ providerId: 'openai', role, context }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'OpenAI provider request failed.');
  return data as ProviderAnalysisResult;
}

export class OpenaiProvider implements AIProvider {
  readonly id: AIProviderId = 'openai';
  readonly name = 'OpenAI';
  readonly supportedRoles: AgentRole[] = ['Architect', 'Adversarial Reviewer', 'Independent Analyst'];
  // The adapter is available. Credential availability is checked server-side per request.
  readonly isConnected = true;

  async analyzeInvestigation(context: InvestigationContext, role: AgentRole = 'Independent Analyst') {
    return callGateway(context, role);
  }

  async challengeClaim(_claimStatement: string, context: InvestigationContext, role: AgentRole = 'Adversarial Reviewer') {
    const result = await callGateway(context, role);
    return { challengeText: result.analysisText, proposingCounterClaims: result.proposedClaims };
  }

  async suggestExperiments(_claimStatement: string, context: InvestigationContext) {
    return (await callGateway(context, 'Experiment Agent')).recommendedExperiments;
  }
}

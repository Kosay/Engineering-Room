import { AgentRole, AIProviderId } from '../types';
import { getFirebaseAuth } from '../lib/firebase';
import { AIProvider, ClaimDraft, InvestigationContext, ProviderAnalysisResult } from './ai-provider.interface';

async function callGateway(context: InvestigationContext, role: AgentRole): Promise<ProviderAnalysisResult> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Authentication is required for AI provider requests.');
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify({ providerId: 'openai', role, context }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'OpenAI provider request failed.');
  return data as ProviderAnalysisResult;
}

export class OpenAIProvider implements AIProvider {
  readonly id: AIProviderId = 'openai';
  readonly name = 'OpenAI';
  readonly supportedRoles: AgentRole[] = ['Architect', 'Adversarial Reviewer', 'Independent Analyst'];
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

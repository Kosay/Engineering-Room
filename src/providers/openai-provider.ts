/**
 * OpenAI Provider Implementation (Architecture Ready)
 * Configured for future multi-agent debate (e.g. GPT-4o Architect/Reviewer)
 */

import { AgentRole, AIProviderId } from '../types';
import {
  AIProvider,
  ClaimDraft,
  ExperimentSuggestion,
  InvestigationContext,
  ProviderAnalysisResult,
} from './ai-provider.interface';

export class OpenAIProvider implements AIProvider {
  readonly id: AIProviderId = 'openai';
  readonly name = 'OpenAI (GPT-4o)';
  readonly supportedRoles: AgentRole[] = [
    'Architect',
    'Adversarial Reviewer',
    'Independent Analyst',
  ];
  readonly isConnected = false; // Flagged as pending user API key integration

  async analyzeInvestigation(
    context: InvestigationContext,
    role: AgentRole = 'Independent Analyst'
  ): Promise<ProviderAnalysisResult> {
    throw new Error(
      'OpenAI provider is not yet activated. Provide an OPENAI_API_KEY to activate this provider.'
    );
  }

  async challengeClaim(
    claimStatement: string,
    context: InvestigationContext,
    role: AgentRole = 'Adversarial Reviewer'
  ): Promise<{
    challengeText: string;
    proposingCounterClaims: ClaimDraft[];
  }> {
    throw new Error('OpenAI provider is not yet activated.');
  }

  async suggestExperiments(
    claimStatement: string,
    context: InvestigationContext
  ): Promise<ExperimentSuggestion[]> {
    throw new Error('OpenAI provider is not yet activated.');
  }
}

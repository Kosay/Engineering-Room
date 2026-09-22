/**
 * Anthropic Claude Provider Implementation (Architecture Ready)
 * Configured for future multi-agent debate (e.g. Claude 3.7 Sonnet Reviewer)
 */

import { AgentRole, AIProviderId } from '../types';
import {
  AIProvider,
  ClaimDraft,
  ExperimentSuggestion,
  InvestigationContext,
  ProviderAnalysisResult,
} from './ai-provider.interface';

export class AnthropicProvider implements AIProvider {
  readonly id: AIProviderId = 'anthropic';
  readonly name = 'Anthropic Claude';
  readonly supportedRoles: AgentRole[] = [
    'Adversarial Reviewer',
    'Evidence Researcher',
    'Architect',
  ];
  readonly isConnected = false;

  async analyzeInvestigation(
    context: InvestigationContext,
    role: AgentRole = 'Adversarial Reviewer'
  ): Promise<ProviderAnalysisResult> {
    throw new Error('Anthropic provider is not yet activated.');
  }

  async challengeClaim(
    claimStatement: string,
    context: InvestigationContext,
    role: AgentRole = 'Adversarial Reviewer'
  ): Promise<{
    challengeText: string;
    proposingCounterClaims: ClaimDraft[];
  }> {
    throw new Error('Anthropic provider is not yet activated.');
  }

  async suggestExperiments(
    claimStatement: string,
    context: InvestigationContext
  ): Promise<ExperimentSuggestion[]> {
    throw new Error('Anthropic provider is not yet activated.');
  }
}

/**
 * DeepSeek Provider Implementation (Architecture Ready)
 * Configured for future deep code inspection (e.g. DeepSeek-R1 / V3)
 */

import { AgentRole, AIProviderId } from '../types';
import {
  AIProvider,
  ClaimDraft,
  ExperimentSuggestion,
  InvestigationContext,
  ProviderAnalysisResult,
} from './ai-provider.interface';

export class DeepSeekProvider implements AIProvider {
  readonly id: AIProviderId = 'deepseek';
  readonly name = 'DeepSeek R1 / V3';
  readonly supportedRoles: AgentRole[] = [
    'Independent Analyst',
    'Experiment Agent',
    'Implementation Agent',
  ];
  readonly isConnected = false;

  async analyzeInvestigation(
    context: InvestigationContext,
    role: AgentRole = 'Independent Analyst'
  ): Promise<ProviderAnalysisResult> {
    throw new Error('DeepSeek provider is not yet activated.');
  }

  async challengeClaim(
    claimStatement: string,
    context: InvestigationContext,
    role: AgentRole = 'Independent Analyst'
  ): Promise<{
    challengeText: string;
    proposingCounterClaims: ClaimDraft[];
  }> {
    throw new Error('DeepSeek provider is not yet activated.');
  }

  async suggestExperiments(
    claimStatement: string,
    context: InvestigationContext
  ): Promise<ExperimentSuggestion[]> {
    throw new Error('DeepSeek provider is not yet activated.');
  }
}

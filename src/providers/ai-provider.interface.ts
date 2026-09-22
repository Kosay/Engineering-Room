/**
 * AI Provider Abstraction Interface
 * Decouples the KMH AI Engineering Room from specific vendors
 */

import { AgentRole, AIProviderId, EvidenceType } from '../types';

export interface InvestigationContext {
  title: string;
  question: string;
  environment: string;
  phase: string;
  existingClaims: Array<{
    id: string;
    statement: string;
    status: string;
  }>;
  existingEvidence: Array<{
    id: string;
    type: EvidenceType;
    title: string;
    excerpt: string;
  }>;
  existingExperiments: Array<{
    id: string;
    title: string;
    outcome: string;
    actualResult?: string;
  }>;
}

export interface ClaimDraft {
  statement: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  initialStatus: 'unverified' | 'supported' | 'unknown';
  rationale: string;
}

export interface ChallengeDraft {
  challenge: string;
  targetClaimStatement: string;
  counterHypothesis?: string;
}

export interface ExperimentSuggestion {
  title: string;
  objective: string;
  commandOrProcedure: string;
  expectedResult: string;
  targetClaimStatement?: string;
}

export interface ProviderAnalysisResult {
  providerId: AIProviderId;
  agentRole: AgentRole;
  analysisText: string;
  proposedClaims: ClaimDraft[];
  counterChallenges: ChallengeDraft[];
  recommendedExperiments: ExperimentSuggestion[];
  rawTimestamp: string;
}

export interface AIProvider {
  readonly id: AIProviderId;
  readonly name: string;
  readonly supportedRoles: AgentRole[];
  readonly isConnected: boolean;

  analyzeInvestigation(
    context: InvestigationContext,
    role?: AgentRole
  ): Promise<ProviderAnalysisResult>;

  challengeClaim(
    claimStatement: string,
    context: InvestigationContext,
    role?: AgentRole
  ): Promise<{
    challengeText: string;
    proposingCounterClaims: ClaimDraft[];
  }>;

  suggestExperiments(
    claimStatement: string,
    context: InvestigationContext
  ): Promise<ExperimentSuggestion[]>;
}

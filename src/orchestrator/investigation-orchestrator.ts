/**
 * Investigation Orchestrator
 * Central coordinator for engineering investigations, multi-agent debates, and claim verification.
 */

import {
  AgentRole,
  AIProviderId,
  Claim,
  Decision,
  Evidence,
  Experiment,
  Investigation,
} from '../types';
import { ContextBuilder } from './context-builder';
import { AgentRunner } from './agent-runner';
import { ClaimManager } from './claim-manager';
import { DecisionManager, DecisionReadiness } from './decision-manager';
import { ProviderAnalysisResult } from '../providers/ai-provider.interface';
import { providerRegistry } from '../providers/provider-registry';


export interface AgentPanelResult {
  providerId: AIProviderId;
  role: AgentRole;
  status: 'completed' | 'failed';
  result?: ProviderAnalysisResult;
  error?: string;
}

export class InvestigationOrchestrator {
  /**
   * Runs an AI analysis for the investigation.
   * Proposes hypotheses that MUST start as [unverified] claims.
   */
  public static async executeAnalysis(
    investigation: Investigation,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[],
    providerId: AIProviderId = 'gemini',
    role: AgentRole = 'Architect'
  ): Promise<ProviderAnalysisResult> {
    const context = ContextBuilder.buildContext(
      investigation,
      claims,
      evidence,
      experiments
    );

    return await AgentRunner.runAgent(providerId, role, context);
  }

  /**
   * Runs independent analyses in parallel.
   * No provider is treated as authoritative; failures are preserved as explicit results.
   */
  public static async runIndependentPanel(
    investigation: Investigation,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[],
    providerIds?: AIProviderId[]
  ): Promise<AgentPanelResult[]> {
    const context = ContextBuilder.buildContext(
      investigation,
      claims,
      evidence,
      experiments
    );

    const requestedProviders = providerIds?.length
      ? providerIds
      : providerRegistry.getConnectedProviders().map((provider) => provider.id);

    if (requestedProviders.length === 0) {
      throw new Error('No connected AI providers are available for an independent panel.');
    }

    const jobs = requestedProviders.map(async (providerId): Promise<AgentPanelResult> => {
      const provider = providerRegistry.getProvider(providerId);
      const role = provider.supportedRoles.includes('Independent Analyst')
        ? 'Independent Analyst'
        : provider.supportedRoles[0];

      try {
        const result = await AgentRunner.runAgent(providerId, role, context);
        return { providerId, role, status: 'completed', result };
      } catch (error) {
        return {
          providerId,
          role,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    return await Promise.all(jobs);
  }

  /**
   * Reconciles all claims against attached evidence and test results.
   */
  public static reconcileClaims(
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[]
  ): Array<{
    claimId: string;
    oldStatus: string;
    newStatus: string;
    rationale: string;
  }> {
    return claims.map((claim) => {
      const attachedEvidence = evidence.filter((e) =>
        claim.relatedEvidenceIds.includes(e.id)
      );
      const attachedExperiments = experiments.filter((exp) =>
        claim.relatedExperimentIds.includes(exp.id)
      );

      const evaluation = ClaimManager.evaluateStatus(
        claim,
        attachedEvidence,
        attachedExperiments
      );

      return {
        claimId: claim.id,
        oldStatus: claim.status,
        newStatus: evaluation.recommendedStatus,
        rationale: evaluation.rationale,
      };
    });
  }

  /**
   * Validates whether a decision can be approved.
   */
  public static assessDecisionReadiness(
    decision: Decision,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[]
  ): DecisionReadiness {
    return DecisionManager.evaluateDecisionReadiness(
      decision,
      claims,
      evidence,
      experiments
    );
  }
}

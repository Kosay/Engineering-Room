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

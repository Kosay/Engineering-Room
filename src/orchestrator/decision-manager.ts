/**
 * Decision Manager
 * Validates readiness of engineering decisions.
 *
 * CRITICAL RULE:
 * A decision should normally only become approved after the relevant claims
 * have sufficient evidence (verified or well-supported with no unresolved disputes).
 */

import { Claim, Decision, Evidence, Experiment } from '../types';

export interface DecisionReadiness {
  isReadyForApproval: boolean;
  blockers: string[];
  warnings: string[];
  verifiedClaimsCount: number;
  totalRelatedClaims: number;
  passedExperimentsCount: number;
}

export class DecisionManager {
  /**
   * Assesses whether a proposed decision has rigorous evidentiary backing.
   */
  public static evaluateDecisionReadiness(
    decision: Decision,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[]
  ): DecisionReadiness {
    const blockers: string[] = [];
    const warnings: string[] = [];

    const relatedClaims = claims.filter((c) =>
      decision.relatedClaimIds.includes(c.id)
    );
    const relatedExperiments = experiments.filter((e) =>
      decision.relatedExperimentIds.includes(e.id)
    );

    const verifiedClaims = relatedClaims.filter((c) => c.status === 'verified');
    const disputedClaims = relatedClaims.filter((c) => c.status === 'disputed');
    const disprovedClaims = relatedClaims.filter((c) => c.status === 'disproved');
    const passedExperiments = relatedExperiments.filter(
      (e) => e.outcome === 'passed'
    );
    const failedExperiments = relatedExperiments.filter(
      (e) => e.outcome === 'failed'
    );

    if (relatedClaims.length === 0) {
      blockers.push('The decision has no linked claims. Every architectural decision must be substantiated by explicit claims.');
    }

    if (disprovedClaims.length > 0) {
      blockers.push(
        `Decision relies on ${disprovedClaims.length} disproved claim(s): "${disprovedClaims.map((c) => c.statement).join('; ')}".`
      );
    }

    if (disputedClaims.length > 0) {
      warnings.push(
        `Decision references ${disputedClaims.length} disputed claim(s) that have active challenges.`
      );
    }

    if (failedExperiments.length > 0) {
      blockers.push(
        `${failedExperiments.length} related experiment(s) failed during testing.`
      );
    }

    const unverifiedClaims = relatedClaims.filter(
      (c) => c.status === 'unverified' || c.status === 'unknown'
    );
    if (unverifiedClaims.length > 0) {
      warnings.push(
        `${unverifiedClaims.length} supporting claim(s) are still unverified.`
      );
    }

    const isReadyForApproval = blockers.length === 0;

    return {
      isReadyForApproval,
      blockers,
      warnings,
      verifiedClaimsCount: verifiedClaims.length,
      totalRelatedClaims: relatedClaims.length,
      passedExperimentsCount: passedExperiments.length,
    };
  }
}

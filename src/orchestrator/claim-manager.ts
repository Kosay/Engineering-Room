/**
 * Claim Manager
 * First-class engineering object lifecycle and epistemic state transitions.
 *
 * CRITICAL RULE:
 * "supported" does NOT mean "verified".
 * An AI assertion must NEVER automatically become verified.
 * Verification requires either authoritative official documentation + passing reproducible experiments.
 */

import {
  AgentRole,
  Claim,
  ClaimArgument,
  ClaimChallenge,
  EpistemicStatus,
  Evidence,
  Experiment,
} from '../types';

export class ClaimManager {
  /**
   * Evaluates the recommended epistemic status based on attached evidence and experiments.
   * Ensures AI statements cannot unilaterally flip to 'verified'.
   */
  public static evaluateStatus(
    claim: Claim,
    attachedEvidence: Evidence[],
    attachedExperiments: Experiment[]
  ): {
    recommendedStatus: EpistemicStatus;
    rationale: string;
    canBeVerified: boolean;
  } {
    // Check if any experiment directly failed
    const failedExperiments = attachedExperiments.filter(
      (e) => e.outcome === 'failed'
    );
    if (failedExperiments.length > 0) {
      return {
        recommendedStatus: 'disproved',
        rationale: `Falsified by ${failedExperiments.length} failed experiment(s): ${failedExperiments.map((e) => e.title).join(', ')}`,
        canBeVerified: false,
      };
    }

    // Check active challenges or counter-arguments
    const hasActiveDisputes =
      claim.challenges.length > 0 ||
      claim.arguments.some((arg) => arg.type === 'contra');

    const passedExperiments = attachedExperiments.filter(
      (e) => e.outcome === 'passed'
    );

    const highReliabilityEvidence = attachedEvidence.filter(
      (ev) =>
        ev.reliability === 'high' &&
        ev.type !== 'agent_reasoning' // Agent reasoning is never sufficient for verification!
    );

    // To be VERIFIED: must have at least 1 passed experiment OR 1 high-reliability empirical/official source, and no active counter-evidence
    if (passedExperiments.length > 0 && highReliabilityEvidence.length > 0 && !hasActiveDisputes) {
      return {
        recommendedStatus: 'verified',
        rationale: `Verified by ${passedExperiments.length} passing experiment(s) corroborated by high-reliability evidence.`,
        canBeVerified: true,
      };
    }

    if (highReliabilityEvidence.length > 0 && !hasActiveDisputes) {
      return {
        recommendedStatus: 'verified',
        rationale: `Corroborated by high-reliability evidence (${highReliabilityEvidence[0].type}) with no unresolved disputes.`,
        canBeVerified: true,
      };
    }

    if (hasActiveDisputes) {
      return {
        recommendedStatus: 'disputed',
        rationale: `Subject to active adversarial challenges or contra-arguments.`,
        canBeVerified: false,
      };
    }

    // Has evidence or agent support, but NOT verified
    if (attachedEvidence.length > 0 || claim.arguments.length > 0) {
      return {
        recommendedStatus: 'supported',
        rationale: `Supported by initial rationale/evidence, but pending reproducible empirical testing.`,
        canBeVerified: false,
      };
    }

    return {
      recommendedStatus: 'unverified',
      rationale: `Raw unverified hypothesis. Needs evidence or test experiments.`,
      canBeVerified: false,
    };
  }

  /**
   * Creates a challenge against a claim.
   */
  public static addChallenge(
    claim: Claim,
    challenger: string,
    role: AgentRole,
    challengeText: string
  ): ClaimChallenge {
    return {
      id: `challenge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      challenger,
      role,
      challenge: challengeText,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Adds an argument (pro or contra) to a claim.
   */
  public static addArgument(
    author: string,
    role: AgentRole,
    text: string,
    type: 'pro' | 'contra'
  ): ClaimArgument {
    return {
      id: `arg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author,
      role,
      text,
      type,
      timestamp: new Date().toISOString(),
    };
  }
}

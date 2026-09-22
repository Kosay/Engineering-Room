/**
 * Evidence Manager
 * Evaluates technical evidence and enforces reliability weighting.
 *
 * CRITICAL RULE:
 * Agent reasoning must never automatically have the same reliability
 * as official documentation or an actual experiment.
 */

import { Evidence, EvidenceReliability, EvidenceType } from '../types';

export class EvidenceManager {
  /**
   * Sanitizes the reliability based on source type.
   * Agent reasoning cannot be high reliability.
   */
  public static validateReliability(
    type: EvidenceType,
    requestedReliability: EvidenceReliability
  ): EvidenceReliability {
    if (type === 'agent_reasoning') {
      // Hard cap: Agent reasoning is an opinion or inference, never high reliability
      if (requestedReliability === 'high') {
        return 'medium';
      }
    }
    return requestedReliability;
  }

  /**
   * Returns a baseline suggested reliability for a given evidence type.
   */
  public static getBaselineReliability(type: EvidenceType): EvidenceReliability {
    switch (type) {
      case 'official_documentation':
      case 'experiment':
      case 'source_code':
        return 'high';
      case 'github':
      case 'stackoverflow':
        return 'medium';
      case 'agent_reasoning':
      case 'web_article':
      case 'user_report':
      default:
        return 'low';
    }
  }

  /**
   * Summarizes evidence metrics for a claim.
   */
  public static getEvidenceScore(evidenceList: Evidence[]): {
    total: number;
    hasEmpiricalOrOfficial: boolean;
    hasAgentReasoningOnly: boolean;
  } {
    const total = evidenceList.length;
    const hasEmpiricalOrOfficial = evidenceList.some(
      (e) =>
        (e.type === 'official_documentation' ||
          e.type === 'experiment' ||
          e.type === 'source_code') &&
        e.reliability === 'high'
    );
    const hasAgentReasoningOnly =
      total > 0 && evidenceList.every((e) => e.type === 'agent_reasoning');

    return {
      total,
      hasEmpiricalOrOfficial,
      hasAgentReasoningOnly,
    };
  }
}

/**
 * Context Builder
 * Assembles active investigation state into a structured context for AI agents and human review.
 */

import { Claim, Evidence, Experiment, Investigation } from '../types';
import { InvestigationContext } from '../providers/ai-provider.interface';

export class ContextBuilder {
  public static buildContext(
    investigation: Investigation,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[]
  ): InvestigationContext {
    return {
      title: investigation.title,
      question: investigation.question,
      environment: investigation.environment,
      phase: investigation.phase,
      existingClaims: claims.map((c) => ({
        id: c.id,
        statement: c.statement,
        status: c.status,
      })),
      existingEvidence: evidence.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        excerpt: e.excerpt,
      })),
      existingExperiments: experiments.map((exp) => ({
        id: exp.id,
        title: exp.title,
        outcome: exp.outcome,
        actualResult: exp.actualResult,
      })),
    };
  }
}

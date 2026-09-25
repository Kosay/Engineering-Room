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
        importance: c.importance,
        arguments: c.arguments.map((a) => ({
          author: a.author,
          role: a.role,
          text: a.text,
          type: a.type,
        })),
        challenges: c.challenges.map((ch) => ({
          challenger: ch.challenger,
          role: ch.role,
          challenge: ch.challenge,
        })),
      })),
      existingEvidence: evidence.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        excerpt: e.excerpt,
        reliability: e.reliability,
        sourceType: e.sourceType,
      })),
      existingExperiments: experiments.map((exp) => ({
        id: exp.id,
        title: exp.title,
        outcome: exp.outcome,
        actualResult: exp.actualResult,
        objective: exp.objective,
        procedure: exp.commandOrProcedure,
        expectedResult: exp.expectedResult,
      })),
    };
  }
}

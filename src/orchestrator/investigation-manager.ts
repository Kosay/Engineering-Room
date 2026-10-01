import { InvestigationPhase } from '../types';

const NEXT_PHASES: Record<InvestigationPhase, InvestigationPhase[]> = {
  question: ['analysis'],
  analysis: ['debate', 'evidence'],
  debate: ['evidence'],
  evidence: ['experiment', 'reconciliation'],
  experiment: ['reconciliation', 'evidence'],
  reconciliation: ['decision', 'evidence', 'experiment'],
  decision: ['implementation', 'reconciliation'],
  implementation: ['completed', 'decision'],
  completed: [],
};

export class InvestigationManager {
  public static canTransition(
    from: InvestigationPhase,
    to: InvestigationPhase
  ): boolean {
    return from === to || NEXT_PHASES[from].includes(to);
  }

  public static assertTransition(
    from: InvestigationPhase,
    to: InvestigationPhase
  ): void {
    if (!this.canTransition(from, to)) {
      throw new Error(
        `Invalid investigation phase transition: ${from} -> ${to}. Move through the engineering lifecycle explicitly.`
      );
    }
  }
}

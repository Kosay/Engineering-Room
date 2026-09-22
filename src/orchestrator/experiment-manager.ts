/**
 * Experiment Manager
 * Manages reproducible technical tests, execution logs, and validation outcomes.
 */

import { Experiment, ExperimentOutcome, ExperimentStatus } from '../types';

export class ExperimentManager {
  /**
   * Applies an outcome to an experiment.
   */
  public static recordResult(
    experiment: Experiment,
    outcome: ExperimentOutcome,
    actualResult: string,
    executedBy: string
  ): Experiment {
    const status: ExperimentStatus =
      outcome === 'not_run' ? 'draft' : 'completed';

    return {
      ...experiment,
      status,
      outcome,
      actualResult,
      executedBy,
      executionTimestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluates if an experiment is rigorous enough to justify claim status change.
   */
  public static isExperimentConclusive(experiment: Experiment): boolean {
    return (
      (experiment.outcome === 'passed' || experiment.outcome === 'failed') &&
      Boolean(experiment.actualResult && experiment.actualResult.trim().length > 10)
    );
  }
}

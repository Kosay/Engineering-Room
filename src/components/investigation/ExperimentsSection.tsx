/**
 * Experiments Section
 * Reproducible technical tests and empirical validation logs
 */

import React from 'react';
import {
  Plus,
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Clock,
  Terminal,
  FileCode2,
} from 'lucide-react';
import { Claim, Experiment, ExperimentOutcome } from '../../types';

interface ExperimentsSectionProps {
  experiments: Experiment[];
  claims: Claim[];
  onOpenCreateExperiment: () => void;
  onOpenRecordResult: (experiment: Experiment) => void;
}

export const ExperimentsSection: React.FC<ExperimentsSectionProps> = ({
  experiments,
  claims,
  onOpenCreateExperiment,
  onOpenRecordResult,
}) => {
  const getClaimStatement = (claimId: string) => {
    const claim = claims.find((c) => c.id === claimId);
    return claim ? claim.statement : claimId;
  };

  const outcomeBadge = (outcome: ExperimentOutcome) => {
    const config: Record<
      ExperimentOutcome,
      { label: string; icon: any; style: string }
    > = {
      passed: {
        label: 'PASSED',
        icon: CheckCircle2,
        style: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
      },
      failed: {
        label: 'FAILED',
        icon: XCircle,
        style: 'bg-rose-950/90 text-rose-300 border-rose-500/50',
      },
      partial: {
        label: 'PARTIAL',
        icon: AlertCircle,
        style: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
      },
      inconclusive: {
        label: 'INCONCLUSIVE',
        icon: HelpCircle,
        style: 'bg-slate-900 text-slate-300 border-slate-700',
      },
      not_run: {
        label: 'NOT RUN',
        icon: Clock,
        style: 'bg-slate-950 text-slate-500 border-slate-800',
      },
    };

    const opt = config[outcome] || config.not_run;
    const Icon = opt.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-md border tracking-wider ${opt.style}`}
      >
        <Icon size={13} />
        {opt.label}
      </span>
    );
  };

  return (
    <section
      id="section-experiments"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Step 4 of 6 // Reproducible Experiments
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              {experiments.length} {experiments.length === 1 ? 'Test' : 'Tests'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Technical Experiments
          </h2>
          <p className="text-xs text-slate-400">
            Reproducible test procedures executed against the target environment to turn hypotheses into verified engineering facts.
          </p>
        </div>

        <button
          id="btn-open-create-experiment"
          onClick={onOpenCreateExperiment}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          Define Experiment
        </button>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg p-6 space-y-2">
          <p className="text-sm text-slate-400">
            No empirical experiments defined yet.
          </p>
          <button
            onClick={onOpenCreateExperiment}
            className="text-xs text-cyan-400 hover:underline font-medium"
          >
            Create an executable test procedure (e.g. C# probe, registry query, PowerShell script) to empirically test claims.
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              id={`card-experiment-${exp.id}`}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition-all"
            >
              {/* Header: Title, Outcome Badge, Status */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono uppercase text-slate-500">
                      Status: {exp.status}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Env: {exp.environment}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    {exp.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {outcomeBadge(exp.outcome)}
                  <button
                    id={`btn-record-result-${exp.id}`}
                    onClick={() => onOpenRecordResult(exp)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
                  >
                    <Terminal size={13} />
                    {exp.actualResult ? 'Update Result' : 'Record Result'}
                  </button>
                </div>
              </div>

              {/* Objective */}
              {exp.objective && (
                <p className="text-xs text-slate-300">
                  <span className="font-mono text-slate-500 uppercase">Objective: </span>
                  {exp.objective}
                </p>
              )}

              {/* Command / Procedure Code block */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Executable Test Procedure / Command:
                </span>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre">
                  {exp.commandOrProcedure}
                </div>
              </div>

              {/* Expected vs Actual Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase">
                    Expected Result:
                  </span>
                  <p className="text-slate-300">{exp.expectedResult}</p>
                </div>

                <div
                  className={`p-3 rounded-lg border space-y-1 ${
                    exp.actualResult
                      ? exp.outcome === 'passed'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] uppercase block font-semibold">
                    Actual Result:
                  </span>
                  <p className="font-semibold">
                    {exp.actualResult || 'Test pending execution. Click [Record Result] when run.'}
                  </p>
                </div>
              </div>

              {/* Artifacts if present */}
              {exp.artifacts && exp.artifacts.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                    <FileCode2 size={12} />
                    Artifacts & Logs:
                  </span>
                  {exp.artifacts.map((art) => (
                    <div
                      key={art.id}
                      className="p-2.5 bg-slate-900/80 border border-slate-800 rounded text-xs font-mono text-slate-300"
                    >
                      <div className="text-[10px] text-cyan-400 font-bold mb-1">
                        {art.name} ({art.type})
                      </div>
                      <div className="text-[11px] whitespace-pre-wrap text-slate-400">
                        {art.contentOrUrl}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer: Validated Claims & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-2">
                  <span>Validates:</span>
                  {exp.relatedClaimIds.map((cId) => (
                    <span
                      key={cId}
                      className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {getClaimStatement(cId)}
                    </span>
                  ))}
                </div>

                {exp.executedBy && (
                  <div>
                    Executed by {exp.executedBy}
                    {exp.executionTimestamp && ` on ${new Date(exp.executionTimestamp).toLocaleDateString()}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

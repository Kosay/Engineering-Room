/**
 * Record Experiment Result Modal
 */

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, HelpCircle, AlertCircle } from 'lucide-react';
import { Experiment, ExperimentOutcome } from '../../types';

interface RecordExperimentResultModalProps {
  isOpen: boolean;
  experiment: Experiment | null;
  onClose: () => void;
  onSubmit: (data: {
    outcome: ExperimentOutcome;
    actualResult: string;
    executedBy: string;
    artifactName?: string;
    artifactContent?: string;
  }) => Promise<void>;
}

export const RecordExperimentResultModal: React.FC<RecordExperimentResultModalProps> = ({
  isOpen,
  experiment,
  onClose,
  onSubmit,
}) => {
  const [outcome, setOutcome] = useState<ExperimentOutcome>(
    experiment?.outcome && experiment.outcome !== 'not_run' ? experiment.outcome : 'passed'
  );
  const [actualResult, setActualResult] = useState(experiment?.actualResult || '');
  const [executedBy, setExecutedBy] = useState(experiment?.executedBy || 'Lead Architect');
  const [artifactName, setArtifactName] = useState('execution_terminal.log');
  const [artifactContent, setArtifactContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (experiment) {
      if (experiment.outcome && experiment.outcome !== 'not_run') {
        setOutcome(experiment.outcome);
      } else {
        setOutcome('passed');
      }
      setActualResult(experiment.actualResult || '');
      setExecutedBy(experiment.executedBy || 'Lead Architect');
    }
  }, [experiment]);

  if (!isOpen || !experiment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualResult.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        outcome,
        actualResult: actualResult.trim(),
        executedBy: executedBy.trim(),
        artifactName: artifactName.trim() || undefined,
        artifactContent: artifactContent.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to record result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const outcomeColors: Record<ExperimentOutcome, string> = {
    passed: 'border-emerald-500 bg-emerald-950/40 text-emerald-300',
    failed: 'border-rose-500 bg-rose-950/40 text-rose-300',
    partial: 'border-amber-500 bg-amber-950/40 text-amber-300',
    inconclusive: 'border-slate-500 bg-slate-900 text-slate-300',
    not_run: 'border-slate-700 bg-slate-950 text-slate-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="modal-record-result"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Record Test Execution Result
            </h2>
            <p className="text-xs text-slate-400">
              Document verifiable runtime findings to substantiate or falsify linked claims.
            </p>
          </div>
          <button
            id="btn-close-record-result"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
            <span className="text-slate-500 font-mono">Procedure:</span>
            <p className="text-slate-200 font-medium">{experiment.title}</p>
            <div className="text-slate-400 font-mono text-[11px] bg-slate-900/80 p-2 rounded mt-1 border border-slate-800">
              {experiment.commandOrProcedure}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Execution Outcome *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'passed', label: 'PASSED', icon: CheckCircle2, desc: 'Met expected result' },
                { id: 'failed', label: 'FAILED', icon: XCircle, desc: 'Falsified expected result' },
                { id: 'partial', label: 'PARTIAL', icon: AlertCircle, desc: 'Met partially' },
                { id: 'inconclusive', label: 'INCONCLUSIVE', icon: HelpCircle, desc: 'Ambiguous or crashed' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = outcome === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOutcome(opt.id as ExperimentOutcome)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? outcomeColors[opt.id as ExperimentOutcome] + ' ring-1 ring-cyan-500'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold">{opt.label}</span>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] opacity-80 mt-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Actual Observed Result (Empirical Output) *
            </label>
            <textarea
              id="input-exp-actual-result"
              required
              rows={3}
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              placeholder="What specifically occurred when running the test? (e.g. S_OK returned pointer to Kwps.Application, whereas Word.Application failed)"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Executed By
              </label>
              <input
                id="input-exp-executed-by"
                type="text"
                required
                value={executedBy}
                onChange={(e) => setExecutedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Artifact Name (Optional)
              </label>
              <input
                id="input-exp-artifact-name"
                type="text"
                value={artifactName}
                onChange={(e) => setArtifactName(e.target.value)}
                placeholder="terminal_output.log"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Execution Log / Trace Artifact (Optional)
            </label>
            <textarea
              id="input-exp-artifact-content"
              rows={3}
              value={artifactContent}
              onChange={(e) => setArtifactContent(e.target.value)}
              placeholder="Paste raw console stdout/stderr or stacktrace..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-record-result"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-record-result"
              disabled={isSubmitting || !actualResult.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Result & Update Claims'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

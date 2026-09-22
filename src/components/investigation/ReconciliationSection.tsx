/**
 * Reconciliation Section
 * Epistemic resolution: Claims vs Empirical Evidence & Experiments
 */

import React from 'react';
import {
  GitMerge,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Claim, Evidence, Experiment, EpistemicStatus } from '../../types';
import { EpistemicBadge } from '../common/EpistemicBadge';
import { ClaimManager } from '../../orchestrator/claim-manager';

interface ReconciliationSectionProps {
  claims: Claim[];
  evidence: Evidence[];
  experiments: Experiment[];
  onReconcileAll: () => Promise<void>;
  onUpdateClaimStatus: (claimId: string, newStatus: EpistemicStatus) => Promise<void>;
}

export const ReconciliationSection: React.FC<ReconciliationSectionProps> = ({
  claims,
  evidence,
  experiments,
  onReconcileAll,
  onUpdateClaimStatus,
}) => {
  const [isReconciling, setIsReconciling] = React.useState(false);

  const handleReconcileAll = async () => {
    setIsReconciling(true);
    try {
      await onReconcileAll();
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <section
      id="section-reconciliation"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Step 5 of 6 // Epistemic Reconciliation
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              Matrix Analysis
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Epistemic Reconciliation Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Synthesizing experimental findings, source documentation, and adversarial critiques to determine factual ground truth.
          </p>
        </div>

        <button
          id="btn-reconcile-all"
          onClick={handleReconcileAll}
          disabled={isReconciling || claims.length === 0}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={isReconciling ? 'animate-spin' : ''} />
          {isReconciling ? 'Reconciling...' : 'Auto-Reconcile Matrix'}
        </button>
      </div>

      {/* Epistemic Golden Rule Card */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          The Rule of Verification vs Hypothesis
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-1">
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
              🟢 VERIFIED
            </span>
            <p className="text-slate-400 text-[11px]">
              Requires at least one PASSED empirical experiment OR verified vendor documentation with zero unaddressed blocking contradictions.
            </p>
          </div>

          <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-1">
            <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
              🟡 SUPPORTED (UNVERIFIED)
            </span>
            <p className="text-slate-400 text-[11px]">
              AI logic or theoretical proposals that have not yet been empirically tested against actual software runtimes.
            </p>
          </div>

          <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800 space-y-1">
            <span className="font-mono font-bold text-rose-400 flex items-center gap-1">
              🔴 DISPROVED
            </span>
            <p className="text-slate-400 text-[11px]">
              Falsified by one or more FAILED reproducible experiments in the target runtime environment.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix */}
      {claims.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">
          No claims available for reconciliation.
        </p>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const relatedExps = experiments.filter((e) =>
              claim.relatedExperimentIds?.includes(e.id)
            );
            const relatedEvs = evidence.filter((ev) =>
              claim.relatedEvidenceIds?.includes(ev.id)
            );
            const passedTests = relatedExps.filter((e) => e.outcome === 'passed');
            const failedTests = relatedExps.filter((e) => e.outcome === 'failed');

            // Compute recommended status
            const evalResult = ClaimManager.evaluateStatus(
              claim,
              relatedEvs,
              relatedExps
            );
            const recommendedStatus = evalResult.recommendedStatus;
            const isStatusMismatch = claim.status !== recommendedStatus;

            return (
              <div
                key={claim.id}
                id={`reconcile-row-${claim.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isStatusMismatch
                    ? 'bg-indigo-950/20 border-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Claim Status:</span>
                    <EpistemicBadge status={claim.status} size="sm" />
                    {isStatusMismatch && (
                      <>
                        <ArrowRight size={13} className="text-slate-500" />
                        <span className="text-xs font-mono text-indigo-300">Recommended:</span>
                        <EpistemicBadge status={recommendedStatus} size="sm" />
                      </>
                    )}
                  </div>

                  {isStatusMismatch && (
                    <button
                      id={`btn-apply-reconcile-${claim.id}`}
                      onClick={() => onUpdateClaimStatus(claim.id, recommendedStatus)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono rounded font-semibold transition-colors"
                    >
                      Apply Recommended Status
                    </button>
                  )}
                </div>

                <div className="font-mono text-xs text-slate-200 font-medium mb-3">
                  "{claim.statement}"
                </div>

                {/* Evidence & Test Balance Sheet */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] font-mono">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Attached Evidence:</span>
                    <span className="text-slate-200 font-bold">{relatedEvs.length} item(s)</span>
                  </div>

                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Passing Tests:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {passedTests.length}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Failing Tests:</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle size={12} />
                      {failedTests.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

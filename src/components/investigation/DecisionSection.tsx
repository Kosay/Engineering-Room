/**
 * Decision Section
 * Architectural decisions grounded in verified evidence
 */

import React from 'react';
import {
  Plus,
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Ban,
  ChevronRight,
} from 'lucide-react';
import { Claim, Decision, DecisionStatus, Evidence, Experiment } from '../../types';
import { DecisionManager } from '../../orchestrator/decision-manager';

interface DecisionSectionProps {
  decisions: Decision[];
  claims: Claim[];
  evidence: Evidence[];
  experiments: Experiment[];
  onOpenCreateDecision: () => void;
  onApproveDecision: (decisionId: string) => Promise<void>;
}

export const DecisionSection: React.FC<DecisionSectionProps> = ({
  decisions,
  claims,
  evidence,
  experiments,
  onOpenCreateDecision,
  onApproveDecision,
}) => {
  const statusStyles: Record<DecisionStatus, { label: string; style: string }> = {
    approved: {
      label: 'APPROVED ARCHITECTURE',
      style: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
    },
    proposed: {
      label: 'PROPOSED (REVIEW PENDING)',
      style: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
    },
    draft: {
      label: 'DRAFT',
      style: 'bg-slate-900 text-slate-400 border-slate-700',
    },
    rejected: {
      label: 'REJECTED',
      style: 'bg-rose-950/90 text-rose-300 border-rose-500/50',
    },
    superseded: {
      label: 'SUPERSEDED',
      style: 'bg-slate-950 text-slate-500 border-slate-800',
    },
  };

  return (
    <section
      id="section-decisions"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Step 6 of 6 // Architectural Decision
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              {decisions.length} {decisions.length === 1 ? 'Decision' : 'Decisions'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Engineering Decisions & Implementations
          </h2>
          <p className="text-xs text-slate-400">
            Binding architectural conclusions. An architecture cannot be approved until underpinning claims are verified.
          </p>
        </div>

        <button
          id="btn-open-create-decision"
          onClick={onOpenCreateDecision}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          Record Decision
        </button>
      </div>

      {decisions.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg p-6 space-y-2">
          <p className="text-sm text-slate-400">
            No formal architectural decisions committed yet.
          </p>
          <button
            onClick={onOpenCreateDecision}
            className="text-xs text-emerald-400 hover:underline font-medium"
          >
            Record the definitive implementation direction once claims have been experimentally reconciled.
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((dec) => {
            const readiness = DecisionManager.evaluateDecisionReadiness(
              dec,
              claims,
              evidence,
              experiments
            );
            const statusConfig = statusStyles[dec.status] || statusStyles.draft;

            return (
              <div
                key={dec.id}
                id={`card-decision-${dec.id}`}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border tracking-wider uppercase ${statusConfig.style}`}
                    >
                      {statusConfig.label}
                    </span>
                    {dec.approvedBy && (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        <UserCheck size={12} />
                        Signed off by: {dec.approvedBy}
                      </span>
                    )}
                  </div>

                  {dec.status === 'proposed' && (
                    <button
                      id={`btn-approve-decision-${dec.id}`}
                      onClick={() => onApproveDecision(dec.id)}
                      disabled={!readiness.isReadyForApproval}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck size={14} />
                      Approve Architecture
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">
                    {dec.title}
                  </h3>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg font-mono text-xs text-emerald-300 leading-relaxed">
                    {dec.decision}
                  </div>
                </div>

                {dec.rationale && (
                  <div className="text-xs text-slate-300 space-y-1">
                    <span className="text-slate-500 font-mono uppercase text-[10px] block">
                      Engineering Justification & Trade-Offs:
                    </span>
                    <p className="leading-relaxed">{dec.rationale}</p>
                  </div>
                )}

                {/* Audit & Blockers */}
                {(!readiness.isReadyForApproval || readiness.warnings.length > 0) && (
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1.5 font-mono">
                    <span className="text-slate-400 font-bold block flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-amber-400" />
                      Verification Audit Status:
                    </span>
                    {readiness.blockers.map((b, i) => (
                      <div key={i} className="text-rose-400 text-[11px] pl-2 border-l-2 border-rose-500">
                        • Blocker: {b}
                      </div>
                    ))}
                    {readiness.warnings.map((w, i) => (
                      <div key={i} className="text-amber-400 text-[11px] pl-2 border-l-2 border-amber-500">
                        • Warning: {w}
                      </div>
                    ))}
                  </div>
                )}

                {/* Backing Foundations */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
                  <span>Backing Claims: {dec.relatedClaimIds?.length || 0}</span>
                  <span>•</span>
                  <span>Supporting Evidence: {dec.relatedEvidenceIds?.length || 0}</span>
                  <span>•</span>
                  <span>Empirical Tests: {dec.relatedExperimentIds?.length || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

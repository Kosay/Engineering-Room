/**
 * Create Decision Modal
 * Validates readiness against claims and empirical evidence
 */

import React, { useState } from 'react';
import { X, CheckSquare, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Claim, DecisionStatus, Evidence, Experiment } from '../../types';
import { DecisionManager } from '../../orchestrator/decision-manager';

interface CreateDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableClaims: Claim[];
  availableEvidence: Evidence[];
  availableExperiments: Experiment[];
  onSubmit: (data: {
    title: string;
    decision: string;
    status: DecisionStatus;
    rationale: string;
    relatedClaimIds: string[];
    relatedEvidenceIds: string[];
    relatedExperimentIds: string[];
    approvedBy?: string;
  }) => Promise<void>;
}

export const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({
  isOpen,
  onClose,
  availableClaims,
  availableEvidence,
  availableExperiments,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [decision, setDecision] = useState('');
  const [status, setStatus] = useState<DecisionStatus>('proposed');
  const [rationale, setRationale] = useState('');
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>(
    availableClaims.map((c) => c.id)
  );
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>(
    availableEvidence.map((e) => e.id)
  );
  const [selectedExperimentIds, setSelectedExperimentIds] = useState<string[]>(
    availableExperiments.map((e) => e.id)
  );
  const [approvedBy, setApprovedBy] = useState('Lead Architect');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluate readiness live
  const readiness = DecisionManager.evaluateDecisionReadiness(
    {
      id: 'temp',
      organizationId: '',
      roomId: '',
      investigationId: '',
      title,
      decision,
      status,
      rationale,
      relatedClaimIds: selectedClaimIds,
      relatedEvidenceIds: selectedEvidenceIds,
      relatedExperimentIds: selectedExperimentIds,
      createdAt: '',
      updatedAt: '',
    },
    availableClaims,
    availableEvidence,
    availableExperiments
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !decision.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        decision: decision.trim(),
        status,
        rationale: rationale.trim(),
        relatedClaimIds: selectedClaimIds,
        relatedEvidenceIds: selectedEvidenceIds,
        relatedExperimentIds: selectedExperimentIds,
        approvedBy: status === 'approved' ? approvedBy : undefined,
      });
      setTitle('');
      setDecision('');
      setRationale('');
      onClose();
    } catch (err) {
      console.error('Failed to create decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleClaim = (id: string) => {
    setSelectedClaimIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="modal-create-decision"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              Record Engineering Decision
            </h2>
            <p className="text-xs text-slate-400">
              Formulate the final architectural resolution grounded in verified evidence.
            </p>
          </div>
          <button
            id="btn-close-create-decision"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Readiness banner */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Epistemic Readiness Audit
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                  readiness.isReadyForApproval
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {readiness.isReadyForApproval ? 'READY FOR APPROVAL' : 'PENDING EMPIRICAL BACKING'}
              </span>
            </div>

            {readiness.blockers.length > 0 && (
              <div className="space-y-1 text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-500/30">
                <span className="font-bold block">Approval Blockers:</span>
                {readiness.blockers.map((b, i) => (
                  <p key={i}>• {b}</p>
                ))}
              </div>
            )}

            {readiness.warnings.length > 0 && (
              <div className="space-y-1 text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-500/30">
                <span className="font-bold block">Notices:</span>
                {readiness.warnings.map((w, i) => (
                  <p key={i}>• {w}</p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Decision Title *
            </label>
            <input
              id="input-decision-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Adopt P/Invoke Kwps.Application with ROT Fallback for .NET 8 WPF Integration"'
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Decision Status
              </label>
              <select
                id="select-decision-status"
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="proposed">Proposed (Pending Peer Review)</option>
                <option
                  value="approved"
                  disabled={!readiness.isReadyForApproval}
                >
                  Approved {!readiness.isReadyForApproval ? '(Disabled: Blockers Present)' : ''}
                </option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Sign-off / Approver
              </label>
              <input
                id="input-decision-approver"
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Concrete Architectural Decision (What will be built) *
            </label>
            <textarea
              id="input-decision-statement"
              required
              rows={3}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="State the concrete architectural mandate: We will implement Kwps.Application via P/Invoke to oleaut32!GetActiveObject..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Engineering Rationale & Justification
            </label>
            <textarea
              id="input-decision-rationale"
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why this solution was selected over rejected alternatives based on empirical test results..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Underpinning Claims ({selectedClaimIds.length} selected)
            </label>
            <div className="max-h-28 overflow-y-auto space-y-1 p-2 bg-slate-950 border border-slate-800 rounded-lg">
              {availableClaims.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-xs hover:bg-slate-900 p-1 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClaimIds.includes(c.id)}
                    onChange={() => toggleClaim(c.id)}
                    className="rounded border-slate-700 text-emerald-500 bg-slate-900"
                  />
                  <span className="font-mono text-slate-300 line-clamp-1">
                    [{c.status.toUpperCase()}] {c.statement}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-decision"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-decision"
              disabled={isSubmitting || !title.trim() || !decision.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Commit Decision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

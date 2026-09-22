/**
 * Create Claim Modal
 */

import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles } from 'lucide-react';
import { EpistemicStatus } from '../../types';

interface CreateClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    statement: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    initialStatus: EpistemicStatus;
    rationale?: string;
  }) => Promise<void>;
  defaultStatement?: string;
  defaultRationale?: string;
}

export const CreateClaimModal: React.FC<CreateClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultStatement = '',
  defaultRationale = '',
}) => {
  const [statement, setStatement] = useState(defaultStatement);
  const [importance, setImportance] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [initialStatus, setInitialStatus] = useState<EpistemicStatus>('unverified');
  const [rationale, setRationale] = useState(defaultRationale);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync defaults if passed dynamically
  React.useEffect(() => {
    if (defaultStatement) setStatement(defaultStatement);
    if (defaultRationale) setRationale(defaultRationale);
  }, [defaultStatement, defaultRationale]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        statement: statement.trim(),
        importance,
        initialStatus,
        rationale: rationale.trim(),
      });
      setStatement('');
      setRationale('');
      onClose();
    } catch (err) {
      console.error('Failed to create claim:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="modal-create-claim"
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">🟡</span> Create Engineering Claim
            </h2>
            <p className="text-xs text-slate-400">
              Claims are falsifiable technical statements that require empirical evidence.
            </p>
          </div>
          <button
            id="btn-close-create-claim"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Engineering Rule Notice */}
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200/90 flex gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Epistemic Rule: </span>
              "Supported" does NOT mean "Verified". New claims must enter as <span className="font-mono text-amber-300">unverified</span> or <span className="font-mono text-amber-300">supported</span> until backed by verified empirical test runs.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Claim Statement (Falsifiable Assertion) *
            </label>
            <textarea
              id="input-claim-statement"
              required
              rows={3}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder='e.g. "WPS Writer supports standard Microsoft Word COM automation via ProgID Word.Application"'
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Importance
              </label>
              <select
                id="select-claim-importance"
                value={importance}
                onChange={(e: any) => setImportance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="critical">Critical (Blocker)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                id="select-claim-status"
                value={initialStatus}
                onChange={(e: any) => setInitialStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="unverified">🟡 Unverified (Default)</option>
                <option value="supported">🟡 Supported (Theory only)</option>
                <option value="unknown">⚪ Unknown</option>
                <option value="disputed">🟠 Disputed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Initial Rationale / Argument
            </label>
            <textarea
              id="input-claim-rationale"
              rows={2}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why is this proposed? (e.g. Reference to documentation or architecture hypothesis)"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-create-claim"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-create-claim"
              disabled={isSubmitting || !statement.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              {isSubmitting ? 'Registering...' : 'Register Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Challenge Claim Modal
 * Allows humans or adversarial agents to submit technical counter-challenges
 */

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { AgentRole, Claim } from '../../types';

interface ChallengeClaimModalProps {
  isOpen: boolean;
  claim: Claim | null;
  onClose: () => void;
  onSubmit: (data: {
    challenger: string;
    role: AgentRole;
    challenge: string;
    markAsDisputed: boolean;
  }) => Promise<void>;
}

export const ChallengeClaimModal: React.FC<ChallengeClaimModalProps> = ({
  isOpen,
  claim,
  onClose,
  onSubmit,
}) => {
  const [challenger, setChallenger] = useState('Adversarial Reviewer');
  const [role, setRole] = useState<AgentRole>('Adversarial Reviewer');
  const [challenge, setChallenge] = useState('');
  const [markAsDisputed, setMarkAsDisputed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !claim) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        challenger: challenger.trim(),
        role,
        challenge: challenge.trim(),
        markAsDisputed,
      });
      setChallenge('');
      onClose();
    } catch (err) {
      console.error('Failed to submit challenge:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="modal-challenge-claim"
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-orange-950/20">
          <div>
            <h2 className="text-base font-semibold text-orange-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Challenge Claim
            </h2>
            <p className="text-xs text-slate-400">
              Submit contradictory facts, architecture conflicts, or edge cases.
            </p>
          </div>
          <button
            id="btn-close-challenge-claim"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <span className="text-slate-500 font-mono block mb-1">Target Claim:</span>
            <p className="text-slate-200 font-mono font-medium">{claim.statement}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Challenger
              </label>
              <input
                id="input-challenger-name"
                type="text"
                required
                value={challenger}
                onChange={(e) => setChallenger(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                id="select-challenger-role"
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="Adversarial Reviewer">Adversarial Reviewer</option>
                <option value="Independent Analyst">Independent Analyst</option>
                <option value="Architect">Architect</option>
                <option value="Human Engineer">Human Engineer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Specific Technical Challenge / Contradiction *
            </label>
            <textarea
              id="input-challenge-text"
              required
              rows={4}
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="e.g. On Windows 11 systems with Microsoft 365 co-installed, HKCR\Word.Application ProgID resolves to WINWORD.EXE, failing Kingsoft WPS interop."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="check-mark-disputed"
              checked={markAsDisputed}
              onChange={(e) => setMarkAsDisputed(e.target.checked)}
              className="rounded border-slate-700 text-orange-500 focus:ring-orange-500 bg-slate-950"
            />
            <label htmlFor="check-mark-disputed" className="text-xs text-slate-300 select-none">
              Automatically flag claim status as <span className="font-mono text-orange-400 font-semibold">🟠 DISPUTED</span>
            </label>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-challenge"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-challenge"
              disabled={isSubmitting || !challenge.trim()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
            >
              {isSubmitting ? 'Posting Challenge...' : 'Post Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

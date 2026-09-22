/**
 * Add Argument Modal (Pro or Contra)
 */

import React, { useState } from 'react';
import { X, MessageSquarePlus } from 'lucide-react';
import { AgentRole, Claim } from '../../types';

interface AddArgumentModalProps {
  isOpen: boolean;
  claim: Claim | null;
  onClose: () => void;
  onSubmit: (data: {
    author: string;
    role: AgentRole;
    text: string;
    type: 'pro' | 'contra';
  }) => Promise<void>;
}

export const AddArgumentModal: React.FC<AddArgumentModalProps> = ({
  isOpen,
  claim,
  onClose,
  onSubmit,
}) => {
  const [author, setAuthor] = useState('Engineer');
  const [role, setRole] = useState<AgentRole>('Human Engineer');
  const [type, setType] = useState<'pro' | 'contra'>('pro');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !claim) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        author: author.trim(),
        role,
        text: text.trim(),
        type,
      });
      setText('');
      onClose();
    } catch (err) {
      console.error('Failed to add argument:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="modal-add-argument"
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-cyan-400" />
              Add Technical Argument
            </h2>
            <p className="text-xs text-slate-400">
              Provide supporting (Pro) or counter (Contra) argumentation to the claim.
            </p>
          </div>
          <button
            id="btn-close-add-argument"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
            {claim.statement}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                id="select-arg-type"
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="pro">Pro (Supporting)</option>
                <option value="contra">Contra (Counter)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Author
              </label>
              <input
                id="input-arg-author"
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                id="select-arg-role"
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Human Engineer">Human Engineer</option>
                <option value="Architect">Architect</option>
                <option value="Adversarial Reviewer">Adversarial Reviewer</option>
                <option value="Independent Analyst">Independent Analyst</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Argument Detail *
            </label>
            <textarea
              id="input-arg-text"
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Detail the technical rationale..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-add-argument"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-argument"
              disabled={isSubmitting || !text.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Argument'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

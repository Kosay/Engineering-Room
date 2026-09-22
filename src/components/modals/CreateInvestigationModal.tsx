/**
 * Create Investigation Modal
 */

import React, { useState } from 'react';
import { X, SearchCode, Sparkles } from 'lucide-react';
import { InvestigationPriority } from '../../types';

interface CreateInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    question: string;
    environment: string;
    priority: InvestigationPriority;
  }) => Promise<void>;
  defaultTarget?: string;
}

export const CreateInvestigationModal: React.FC<CreateInvestigationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultTarget = 'WPS AI (.NET 8 WPF)',
}) => {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [environment, setEnvironment] = useState('Windows 11 x64, .NET 8 (CoreCLR), WPS Office 2024 (v12.1.0)');
  const [priority, setPriority] = useState<InvestigationPriority>('high');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        question: question.trim(),
        environment: environment.trim(),
        priority,
      });
      setTitle('');
      setQuestion('');
      onClose();
    } catch (err) {
      console.error('Failed to create investigation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyWpsExample = () => {
    setTitle('WPS AI: Accessing Foreground Document in .NET 8 WPF');
    setQuestion('How can our .NET 8 WPF application reliably access the active WPS Writer document on Windows 11 without crashing when MS Office is co-installed?');
    setEnvironment('Windows 11 x64, .NET 8, Kingsoft WPS Writer 12.1.0.16412');
    setPriority('critical');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="modal-create-investigation"
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <SearchCode className="w-5 h-5 text-cyan-400" />
              New Engineering Investigation
            </h2>
            <p className="text-xs text-slate-400">
              Formulate a core engineering question to be analyzed, challenged, and verified.
            </p>
          </div>
          <button
            id="btn-close-create-investigation"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-500/30 p-2.5 rounded-lg">
            <span className="text-xs text-cyan-200">
              Need a starting benchmark?
            </span>
            <button
              type="button"
              onClick={handleApplyWpsExample}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Sparkles size={13} />
              Load WPS AI .NET 8 Template
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Investigation Title *
            </label>
            <input
              id="input-inv-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Reliable Active WPS Writer Document Binding in .NET 8"'
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Core Engineering Question *
            </label>
            <textarea
              id="input-inv-question"
              required
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='e.g. "How can our .NET 8 WPF application reliably access the active WPS Writer document?"'
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Operating Environment *
              </label>
              <input
                id="input-inv-env"
                type="text"
                required
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Windows 11, .NET 8, WPS Office"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                id="select-inv-priority"
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="critical">Critical (P0 - Blocker)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium (P2)</option>
                <option value="low">Low (P3)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-investigation"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-investigation"
              disabled={isSubmitting || !title.trim() || !question.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Initialize Investigation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

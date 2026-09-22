/**
 * Create Evidence Modal
 */

import React, { useState } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { Claim, EvidenceReliability, EvidenceType } from '../../types';
import { EvidenceManager } from '../../orchestrator/evidence-manager';

interface CreateEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableClaims: Claim[];
  preselectedClaimId?: string;
  onSubmit: (data: {
    type: EvidenceType;
    title: string;
    sourceUrl?: string;
    sourceType: string;
    excerpt: string;
    reliability: EvidenceReliability;
    relatedClaimIds: string[];
    collectedBy: { id: string; name: string; type: 'human' | 'agent' };
  }) => Promise<void>;
}

export const CreateEvidenceModal: React.FC<CreateEvidenceModalProps> = ({
  isOpen,
  onClose,
  availableClaims,
  preselectedClaimId,
  onSubmit,
}) => {
  const [type, setType] = useState<EvidenceType>('official_documentation');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState('Microsoft Learn / WPS Docs');
  const [excerpt, setExcerpt] = useState('');
  const [reliability, setReliability] = useState<EvidenceReliability>('high');
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>(
    preselectedClaimId ? [preselectedClaimId] : []
  );
  const [collectorName, setCollectorName] = useState('Systems Engineer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (preselectedClaimId) {
      setSelectedClaimIds([preselectedClaimId]);
    }
  }, [preselectedClaimId]);

  // Adjust suggested reliability when type changes
  const handleTypeChange = (newType: EvidenceType) => {
    setType(newType);
    const baseline = EvidenceManager.getBaselineReliability(newType);
    setReliability(baseline);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;

    // Validate reliability rule
    const sanitizedReliability = EvidenceManager.validateReliability(type, reliability);

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        title: title.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        sourceType: sourceType.trim(),
        excerpt: excerpt.trim(),
        reliability: sanitizedReliability,
        relatedClaimIds: selectedClaimIds,
        collectedBy: {
          id: 'user-collector',
          name: collectorName.trim() || 'Engineer',
          type: 'human',
        },
      });
      setTitle('');
      setExcerpt('');
      setSourceUrl('');
      onClose();
    } catch (err) {
      console.error('Failed to submit evidence:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleClaim = (claimId: string) => {
    setSelectedClaimIds((prev) =>
      prev.includes(claimId) ? prev.filter((id) => id !== claimId) : [...prev, claimId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        id="modal-create-evidence"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Record Engineering Evidence
            </h2>
            <p className="text-xs text-slate-400">
              Corroborating citations, official specs, source repositories, or empirical test logs.
            </p>
          </div>
          <button
            id="btn-close-create-evidence"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {type === 'agent_reasoning' && (
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-200 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Epistemic Warning:</strong> Agent reasoning can NEVER be classified as High Reliability. It remains an analytical inference until corroborated by documentation or reproducible tests.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Evidence Source Type *
              </label>
              <select
                id="select-evidence-type"
                value={type}
                onChange={(e: any) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="official_documentation">Official Documentation (Vendor Specs)</option>
                <option value="experiment">Empirical Experiment Run</option>
                <option value="source_code">Source Code / Decompiled Binary</option>
                <option value="github">GitHub Issue / Commit / PR</option>
                <option value="stackoverflow">StackOverflow / Developer Forum</option>
                <option value="web_article">Web Article / Tech Blog</option>
                <option value="agent_reasoning">Agent Reasoning (AI Deduction)</option>
                <option value="user_report">User / QA Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reliability Level *
              </label>
              <select
                id="select-evidence-reliability"
                value={reliability}
                onChange={(e: any) => setReliability(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="high" disabled={type === 'agent_reasoning'}>
                  High (Official Vendor Specs / Passing Binary Test)
                </option>
                <option value="medium">Medium (GitHub / Forum / Corroborated Article)</option>
                <option value="low">Low (Single User Report / Unverified Blog)</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Evidence Title *
            </label>
            <input
              id="input-evidence-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Microsoft Learn: .NET 8 COM Interop Breaking Changes"'
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Source URL (optional)
              </label>
              <input
                id="input-evidence-url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Source Label / Reference
              </label>
              <input
                id="input-evidence-sourcetype"
                type="text"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                placeholder="e.g. MSDN .NET 8 BCL Release Notes"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Direct Technical Excerpt / Description *
            </label>
            <textarea
              id="input-evidence-excerpt"
              required
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Quote the exact documentation paragraph, code snippet, or error message..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Link to Related Claims
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg">
              {availableClaims.length === 0 ? (
                <p className="text-xs text-slate-500 p-1">No claims in this investigation yet.</p>
              ) : (
                availableClaims.map((claim) => (
                  <label
                    key={claim.id}
                    className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClaimIds.includes(claim.id)}
                      onChange={() => toggleClaim(claim.id)}
                      className="mt-0.5 rounded border-slate-700 text-cyan-500 bg-slate-900"
                    />
                    <span className="text-slate-200 line-clamp-1 font-mono">{claim.statement}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-evidence"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-evidence"
              disabled={isSubmitting || !title.trim() || !excerpt.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Record Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

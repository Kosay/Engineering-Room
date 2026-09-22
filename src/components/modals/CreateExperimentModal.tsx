/**
 * Create Experiment Modal
 * Configures reproducible technical test procedures
 */

import React, { useState } from 'react';
import { X, FlaskConical } from 'lucide-react';
import { Claim } from '../../types';

interface CreateExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableClaims: Claim[];
  preselectedClaimId?: string;
  defaultEnvironment?: string;
  defaultTitle?: string;
  defaultObjective?: string;
  defaultProcedure?: string;
  defaultExpected?: string;
  onSubmit: (data: {
    title: string;
    objective: string;
    environment: string;
    commandOrProcedure: string;
    expectedResult: string;
    relatedClaimIds: string[];
  }) => Promise<void>;
}

export const CreateExperimentModal: React.FC<CreateExperimentModalProps> = ({
  isOpen,
  onClose,
  availableClaims,
  preselectedClaimId,
  defaultEnvironment = 'Windows 11 x64, .NET 8, WPS Office 2024',
  defaultTitle = '',
  defaultObjective = '',
  defaultProcedure = '',
  defaultExpected = '',
  onSubmit,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [objective, setObjective] = useState(defaultObjective);
  const [environment, setEnvironment] = useState(defaultEnvironment);
  const [commandOrProcedure, setCommandOrProcedure] = useState(defaultProcedure);
  const [expectedResult, setExpectedResult] = useState(defaultExpected);
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>(
    preselectedClaimId ? [preselectedClaimId] : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (defaultTitle) setTitle(defaultTitle);
    if (defaultObjective) setObjective(defaultObjective);
    if (defaultProcedure) setCommandOrProcedure(defaultProcedure);
    if (defaultExpected) setExpectedResult(defaultExpected);
    if (preselectedClaimId) setSelectedClaimIds([preselectedClaimId]);
  }, [defaultTitle, defaultObjective, defaultProcedure, defaultExpected, preselectedClaimId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !commandOrProcedure.trim() || !expectedResult.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        objective: objective.trim(),
        environment: environment.trim(),
        commandOrProcedure: commandOrProcedure.trim(),
        expectedResult: expectedResult.trim(),
        relatedClaimIds: selectedClaimIds,
      });
      setTitle('');
      setObjective('');
      setCommandOrProcedure('');
      setExpectedResult('');
      onClose();
    } catch (err) {
      console.error('Failed to create experiment:', err);
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
        id="modal-create-experiment"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-amber-400" />
              Define Technical Experiment
            </h2>
            <p className="text-xs text-slate-400">
              Formulate an empirical, reproducible test to verify or falsify claims.
            </p>
          </div>
          <button
            id="btn-close-create-experiment"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Experiment Title *
            </label>
            <input
              id="input-exp-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Test P/Invoke oleaut32!GetActiveObject with ProgID Kwps.Application"'
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Environment *
              </label>
              <input
                id="input-exp-env"
                type="text"
                required
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Windows 11 x64, .NET 8, WPS Office"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Objective
              </label>
              <input
                id="input-exp-objective"
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What falsifiable hypothesis does this prove?"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Command or Test Procedure (Executable Code / Script) *
            </label>
            <textarea
              id="input-exp-procedure"
              required
              rows={4}
              value={commandOrProcedure}
              onChange={(e) => setCommandOrProcedure(e.target.value)}
              placeholder="powershell -Command ... OR dotnet run --project ... OR C# snippet"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Expected Result *
            </label>
            <textarea
              id="input-exp-expected"
              required
              rows={2}
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              placeholder="e.g. S_OK (0x00000000) and RCW pointer returning active document name."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Associated Claims to Validate
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-slate-950 border border-slate-800 rounded-lg">
              {availableClaims.map((claim) => (
                <label
                  key={claim.id}
                  className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedClaimIds.includes(claim.id)}
                    onChange={() => toggleClaim(claim.id)}
                    className="mt-0.5 rounded border-slate-700 text-amber-500 bg-slate-900"
                  />
                  <span className="text-slate-200 line-clamp-1 font-mono">{claim.statement}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-experiment"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-experiment"
              disabled={isSubmitting || !title.trim() || !commandOrProcedure.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Register Test Procedure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

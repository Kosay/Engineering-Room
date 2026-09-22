/**
 * Investigations List View
 */

import React from 'react';
import { Investigation } from '../../types';
import { SearchCode, Plus, ArrowRight } from 'lucide-react';
import { PhaseBadge, PriorityBadge } from '../common/PhaseBadge';

interface InvestigationsListViewProps {
  investigations: Investigation[];
  activeInvestigation: Investigation | null;
  onSelectInvestigation: (inv: Investigation) => void;
  onOpenCreateInvestigation: () => void;
}

export const InvestigationsListView: React.FC<InvestigationsListViewProps> = ({
  investigations,
  activeInvestigation,
  onSelectInvestigation,
  onOpenCreateInvestigation,
}) => {
  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <SearchCode className="text-cyan-400" />
            Engineering Investigations
          </h2>
          <p className="text-xs text-slate-400">
            Systematic investigations pursuing answers to architectural and interop questions.
          </p>
        </div>
        <button
          onClick={onOpenCreateInvestigation}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          New Investigation
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {investigations.map((inv) => {
          const isActive = activeInvestigation?.id === inv.id;
          return (
            <div
              key={inv.id}
              onClick={() => onSelectInvestigation(inv)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isActive
                  ? 'bg-slate-900/90 border-cyan-500/60 ring-1 ring-cyan-500/40'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PhaseBadge phase={inv.phase} />
                  <PriorityBadge priority={inv.priority} />
                  <span className="text-xs font-mono text-slate-500">
                    Env: {inv.environment}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">{inv.title}</h3>
                <p className="text-xs font-mono text-slate-300">"{inv.question}"</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs font-mono px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {isActive ? 'Active Room Focus' : 'Open Investigation'}
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

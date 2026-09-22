/**
 * Question Section
 * First component in the engineering investigation pipeline
 */

import React from 'react';
import { HelpCircle, Monitor, RefreshCw, ChevronRight, Activity } from 'lucide-react';
import { Investigation, InvestigationPhase } from '../../types';
import { PhaseBadge, PriorityBadge } from '../common/PhaseBadge';

interface QuestionSectionProps {
  investigation: Investigation;
  onPhaseChange: (phase: InvestigationPhase) => void;
  onOpenAgentAnalysis: () => void;
}

const PHASES: InvestigationPhase[] = [
  'question',
  'analysis',
  'debate',
  'evidence',
  'experiment',
  'reconciliation',
  'decision',
  'implementation',
  'completed',
];

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  investigation,
  onPhaseChange,
  onOpenAgentAnalysis,
}) => {
  const currentPhaseIndex = PHASES.indexOf(investigation.phase);

  return (
    <section
      id="section-question"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Step 1 of 6 // Core Engineering Question
            </span>
            <PhaseBadge phase={investigation.phase} />
            <PriorityBadge priority={investigation.priority} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            {investigation.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-trigger-ai-analysis"
            onClick={onOpenAgentAnalysis}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5"
          >
            <Activity size={14} />
            Run Gemini Engineering Analysis
          </button>
        </div>
      </div>

      {/* The Central Question Callout */}
      <div className="p-4 bg-slate-950 border-l-4 border-cyan-500 rounded-r-lg shadow-inner">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Primary Problem Statement
            </span>
            <p className="text-base md:text-lg font-mono font-medium text-slate-100 leading-relaxed">
              "{investigation.question}"
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Context & Phase Progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center gap-3">
          <Monitor className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Target Operating Environment
            </span>
            <span className="font-mono text-slate-200 font-semibold">
              {investigation.environment}
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Investigation Phase
            </span>
            <span className="font-mono text-cyan-300 font-semibold uppercase">
              {investigation.phase} ({currentPhaseIndex + 1}/{PHASES.length})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <select
              id="select-investigation-phase"
              value={investigation.phase}
              onChange={(e) => onPhaseChange(e.target.value as InvestigationPhase)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              {PHASES.map((p) => (
                <option key={p} value={p}>
                  Phase: {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Investigation Pipeline Rail Indicator */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5 overflow-x-auto pb-1">
          {PHASES.map((phaseName, idx) => {
            const isPassed = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;
            return (
              <span
                key={phaseName}
                onClick={() => onPhaseChange(phaseName)}
                className={`cursor-pointer px-1 py-0.5 transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-cyan-400 font-bold border-b-2 border-cyan-400'
                    : isPassed
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                {idx + 1}. {phaseName}
              </span>
            );
          })}
        </div>
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-cyan-500 h-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            style={{
              width: `${((currentPhaseIndex + 1) / PHASES.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
};

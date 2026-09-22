/**
 * Phase & Priority Badges
 */

import React from 'react';
import { InvestigationPhase, InvestigationPriority } from '../../types';

export const PhaseBadge: React.FC<{ phase: InvestigationPhase }> = ({ phase }) => {
  const phaseColors: Record<InvestigationPhase, string> = {
    question: 'border-slate-600 bg-slate-900 text-slate-300',
    analysis: 'border-blue-500/50 bg-blue-950/60 text-blue-300',
    debate: 'border-purple-500/50 bg-purple-950/60 text-purple-300',
    evidence: 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300',
    experiment: 'border-amber-500/50 bg-amber-950/60 text-amber-300',
    reconciliation: 'border-indigo-500/50 bg-indigo-950/60 text-indigo-300',
    decision: 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300',
    implementation: 'border-teal-500/50 bg-teal-950/60 text-teal-300',
    completed: 'border-green-500/50 bg-green-950/80 text-green-300',
  };

  return (
    <span
      id={`badge-phase-${phase}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-wide border uppercase ${phaseColors[phase] || 'bg-slate-900 text-slate-300 border-slate-700'}`}
    >
      Phase: {phase}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: InvestigationPriority }> = ({ priority }) => {
  const priorityStyles: Record<InvestigationPriority, string> = {
    critical: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
    high: 'bg-orange-950/70 border-orange-500/50 text-orange-300',
    medium: 'bg-slate-900 border-slate-700 text-slate-300',
    low: 'bg-slate-900/50 border-slate-800 text-slate-400',
  };

  return (
    <span
      id={`badge-priority-${priority}`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border uppercase ${priorityStyles[priority]}`}
    >
      {priority} priority
    </span>
  );
};

/**
 * Epistemic Status Badge
 * Visual distinction rule:
 * 🟢 VERIFIED
 * 🟡 SUPPORTED / UNVERIFIED
 * 🟠 DISPUTED
 * 🔴 DISPROVED
 * ⚪ UNKNOWN
 */

import React from 'react';
import { EpistemicStatus } from '../../types';

interface EpistemicBadgeProps {
  status: EpistemicStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const EpistemicBadge: React.FC<EpistemicBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  const config = {
    verified: {
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
      label: 'VERIFIED',
      symbol: '🟢',
      desc: 'Empirically proven by reproducible experiments or verified official docs',
    },
    supported: {
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      bg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
      label: 'SUPPORTED (UNVERIFIED)',
      symbol: '🟡',
      desc: 'Corroborated by initial rationale or theory, but not yet experimentally proven',
    },
    unverified: {
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
      bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
      label: 'UNVERIFIED',
      symbol: '🟡',
      desc: 'Raw hypothesis or AI statement without empirical validation',
    },
    disputed: {
      dot: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]',
      bg: 'bg-orange-950/80 border-orange-500/50 text-orange-300',
      label: 'DISPUTED',
      symbol: '🟠',
      desc: 'Actively challenged by contradictory observations or adversarial analysis',
    },
    disproved: {
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      bg: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
      label: 'DISPROVED',
      symbol: '🔴',
      desc: 'Falsified by failed reproducible experiments or definitive counter-proof',
    },
    unknown: {
      dot: 'bg-slate-400',
      bg: 'bg-slate-900 border-slate-700 text-slate-400',
      label: 'UNKNOWN',
      symbol: '⚪',
      desc: 'Insufficient data to determine factual state',
    },
  }[status] || {
    dot: 'bg-slate-400',
    bg: 'bg-slate-900 border-slate-700 text-slate-400',
    label: status.toUpperCase(),
    symbol: '⚪',
    desc: '',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  }[size];

  return (
    <span
      id={`badge-status-${status}`}
      title={config.desc}
      className={`inline-flex items-center font-mono font-semibold tracking-wide border rounded-md uppercase select-none transition-colors ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

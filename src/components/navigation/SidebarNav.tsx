/**
 * Main Sidebar Navigation
 * 
 * Required Sections:
 * - Rooms
 * - Investigations
 * - Claims
 * - Evidence
 * - Experiments
 * - Decisions
 */

import React from 'react';
import {
  Cpu,
  SearchCode,
  ShieldAlert,
  FileText,
  FlaskConical,
  CheckSquare,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { Claim } from '../../types';

export type MainNavTab =
  | 'room'
  | 'investigations'
  | 'claims'
  | 'evidence'
  | 'experiments'
  | 'decisions';

interface SidebarNavProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  claims: Claim[];
  investigationsCount: number;
  evidenceCount: number;
  experimentsCount: number;
  decisionsCount: number;
  onOpenCreateInvestigation: () => void;
  activeProjectTarget: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  claims,
  investigationsCount,
  evidenceCount,
  experimentsCount,
  decisionsCount,
  onOpenCreateInvestigation,
  activeProjectTarget,
}) => {
  // Live epistemic status counter
  const verifiedCount = claims.filter((c) => c.status === 'verified').length;
  const unverifiedCount = claims.filter((c) => c.status === 'unverified' || c.status === 'supported').length;
  const disputedCount = claims.filter((c) => c.status === 'disputed').length;
  const disprovedCount = claims.filter((c) => c.status === 'disproved').length;

  const navItems = [
    {
      id: 'room',
      label: 'Engineering Room',
      icon: Cpu,
      desc: 'Active investigation dashboard',
      count: null,
    },
    {
      id: 'investigations',
      label: 'Investigations',
      icon: SearchCode,
      desc: 'Target architectural studies',
      count: investigationsCount,
    },
    {
      id: 'claims',
      label: 'Claims',
      icon: ShieldAlert,
      desc: 'Falsifiable assertions',
      count: claims.length,
    },
    {
      id: 'evidence',
      label: 'Evidence',
      icon: FileText,
      desc: 'Official citations & code',
      count: evidenceCount,
    },
    {
      id: 'experiments',
      label: 'Experiments',
      icon: FlaskConical,
      desc: 'Executable test procedures',
      count: experimentsCount,
    },
    {
      id: 'decisions',
      label: 'Decisions',
      icon: CheckSquare,
      desc: 'Ground-truth architectures',
      count: decisionsCount,
    },
  ] as const;

  return (
    <aside className="w-full lg:w-64 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col justify-between space-y-6">
      <div className="space-y-5">
        {/* Project Target Badge */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
            Target Architecture
          </span>
          <p className="text-xs font-mono font-bold text-cyan-300 truncate">
            {activeProjectTarget}
          </p>
        </div>

        {/* Quick New Investigation Button */}
        <button
          id="btn-sidebar-new-investigation"
          onClick={onOpenCreateInvestigation}
          className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          New Investigation
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1" id="nav-sidebar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => onSelectTab(item.id as MainNavTab)}
                className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 font-semibold border-l-4 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                  <span className="text-xs">{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Epistemic Ledger (Ground-Truth Status Bar) */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-bold">
            Epistemic Ledger
          </span>
          <span className="text-[10px] font-mono text-cyan-400 font-semibold">
            {claims.length} assertions
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              Verified Facts:
            </span>
            <span className="font-bold">{verifiedCount}</span>
          </div>

          <div className="flex items-center justify-between text-amber-300">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Hypotheses:
            </span>
            <span className="font-bold">{unverifiedCount}</span>
          </div>

          <div className="flex items-center justify-between text-orange-300">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Disputed:
            </span>
            <span className="font-bold">{disputedCount}</span>
          </div>

          <div className="flex items-center justify-between text-rose-300">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Disproved:
            </span>
            <span className="font-bold">{disprovedCount}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 leading-tight">
          Strict verification required: code cannot deploy against unverified hypotheses.
        </div>
      </div>
    </aside>
  );
};

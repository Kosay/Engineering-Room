/**
 * Top Application Header
 */

import React from 'react';
import {
  Shield,
  Search,
  LogOut,
  Cpu,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { EngineeringRoom } from '../../types';
import { useAuth } from '../../lib/auth-context';

interface HeaderProps {
  rooms: EngineeringRoom[];
  activeRoom: EngineeringRoom | null;
  onSelectRoom: (room: EngineeringRoom) => void;
  onOpenCreateRoom: () => void;
  onResetSeedData: () => Promise<void>;
  onOpenSearch: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  rooms,
  activeRoom,
  onSelectRoom,
  onOpenCreateRoom,
  onResetSeedData,
  onOpenSearch,
  onOpenSettings,
}) => {
  const { user, signOut } = useAuth();
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    if (confirm('Reload the benchmark WPS AI .NET 8 investigation with verified ground truth?')) {
      setIsResetting(true);
      try {
        await onResetSeedData();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 md:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Room Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100 tracking-tight block whitespace-nowrap">
                KMH AI Engineering Room
              </span>
              <span className="text-[10px] font-mono text-cyan-400 block -mt-0.5 whitespace-nowrap">
                Epistemic Ground-Truth Engine
              </span>
            </div>
          </div>

          <span className="text-slate-700 hidden sm:inline">/</span>

          {/* Room Selector Dropdown */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Cpu size={14} className="text-slate-400 shrink-0" />
            <select
              id="select-active-room"
              value={activeRoom?.id || ''}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  onOpenCreateRoom();
                } else {
                  const target = rooms.find((r) => r.id === e.target.value);
                  if (target) onSelectRoom(target);
                }
              }}
              className="px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-md text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500 max-w-[180px] md:max-w-[240px] truncate"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room: {r.name}
                </option>
              ))}
              <option value="__new__">+ Create New Room...</option>
            </select>
          </div>
        </div>

        {/* Middle: Global Search Trigger Bar */}
        <button
          type="button"
          id="btn-header-search"
          onClick={onOpenSearch}
          className="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-mono transition-all w-full sm:w-auto sm:min-w-[220px] md:min-w-[280px] shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="truncate">Search artifacts...</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
            <kbd>⌘K</kbd>
          </div>
        </button>

        {/* Right Side: Quick Seed Reset, Settings, User Info, Sign Out */}
        <div className="flex items-center gap-2.5">
          {onOpenSettings && (
            <button
              type="button"
              id="btn-header-settings"
              onClick={onOpenSettings}
              title="Configure AI API Keys & Settings"
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5"
            >
              <Settings size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}

          <button
            type="button"
            id="btn-seed-wps"
            onClick={handleReset}
            disabled={isResetting}
            title="Reset to authoritative WPS AI Kingsoft benchmark dataset"
            className="px-2.5 py-1.5 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={12} className={isResetting ? 'animate-spin' : ''} />
            <span className="hidden md:inline">Load WPS Benchmark</span>
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden xl:block">
                <span className="text-xs font-medium text-slate-200 block truncate max-w-[120px]">
                  {user.displayName || 'Engineer'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[120px]">
                  {user.email || 'developer-mode'}
                </span>
              </div>

              <button
                type="button"
                id="btn-signout"
                onClick={() => signOut()}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

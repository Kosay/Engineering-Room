/**
 * Global Search Modal / Command Palette
 * Allows searching across Investigations, Claims, Evidence, Experiments, and Decisions.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  SearchCode,
  ShieldAlert,
  FileText,
  FlaskConical,
  CheckSquare,
  ArrowRight,
  ExternalLink,
  Tag,
  CornerDownLeft,
} from 'lucide-react';
import {
  Investigation,
  Claim,
  Evidence,
  Experiment,
  Decision,
} from '../../types';
import { EpistemicBadge } from '../common/EpistemicBadge';

export type SearchCategory =
  | 'all'
  | 'investigations'
  | 'claims'
  | 'evidence'
  | 'experiments'
  | 'decisions';

export interface SearchResultItem {
  id: string;
  type: 'investigation' | 'claim' | 'evidence' | 'experiment' | 'decision';
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeType?: string;
  investigationId?: string;
  originalItem: Investigation | Claim | Evidence | Experiment | Decision;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigations: Investigation[];
  claims: Claim[];
  evidence: Evidence[];
  experiments: Experiment[];
  decisions: Decision[];
  onSelectResult: (
    type: 'investigation' | 'claim' | 'evidence' | 'experiment' | 'decision',
    id: string,
    investigationId?: string
  ) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  investigations,
  claims,
  evidence,
  experiments,
  decisions,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setActiveCategory('all');
    }
  }, [isOpen]);

  // Search logic
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items: SearchResultItem[] = [];

    // Map helper for investigation titles for context
    const invTitleMap = new Map<string, string>();
    investigations.forEach((inv) => invTitleMap.set(inv.id, inv.title || inv.question));

    // 1. Investigations
    if (activeCategory === 'all' || activeCategory === 'investigations') {
      investigations.forEach((inv) => {
        const text = `${inv.title || ''} ${inv.question || ''} ${inv.environment || ''} ${inv.priority || ''} ${inv.phase || ''}`.toLowerCase();
        if (!q || text.includes(q)) {
          items.push({
            id: inv.id,
            type: 'investigation',
            title: inv.title || inv.question,
            subtitle: `Question: ${inv.question} • Env: ${inv.environment}`,
            badgeText: inv.phase,
            badgeType: 'phase',
            investigationId: inv.id,
            originalItem: inv,
          });
        }
      });
    }

    // 2. Claims
    if (activeCategory === 'all' || activeCategory === 'claims') {
      claims.forEach((claim) => {
        const argsText = (claim.arguments || []).map((a) => a.text).join(' ');
        const challengesText = (claim.challenges || []).map((c) => c.challenge).join(' ');
        const text = `${claim.statement || ''} ${claim.status || ''} ${claim.importance || ''} ${argsText} ${challengesText}`.toLowerCase();
        
        if (!q || text.includes(q)) {
          const parentInvTitle = invTitleMap.get(claim.investigationId) || 'Active Investigation';
          items.push({
            id: claim.id,
            type: 'claim',
            title: claim.statement,
            subtitle: `In: ${parentInvTitle} • ${claim.importance.toUpperCase()} Importance`,
            badgeText: claim.status,
            badgeType: 'epistemic',
            investigationId: claim.investigationId,
            originalItem: claim,
          });
        }
      });
    }

    // 3. Evidence
    if (activeCategory === 'all' || activeCategory === 'evidence') {
      evidence.forEach((ev) => {
        const text = `${ev.title || ''} ${ev.excerpt || ''} ${ev.sourceType || ''} ${ev.sourceUrl || ''} ${ev.reliability || ''}`.toLowerCase();
        if (!q || text.includes(q)) {
          const parentInvTitle = invTitleMap.get(ev.investigationId) || 'Active Investigation';
          items.push({
            id: ev.id,
            type: 'evidence',
            title: ev.title,
            subtitle: `In: ${parentInvTitle} • Excerpt: ${ev.excerpt.slice(0, 90)}...`,
            badgeText: `${ev.sourceType} (${ev.reliability})`,
            badgeType: 'evidence',
            investigationId: ev.investigationId,
            originalItem: ev,
          });
        }
      });
    }

    // 4. Experiments
    if (activeCategory === 'all' || activeCategory === 'experiments') {
      experiments.forEach((exp) => {
        const text = `${exp.title || ''} ${exp.objective || ''} ${exp.commandOrProcedure || ''} ${exp.expectedResult || ''} ${exp.actualResult || ''} ${exp.outcome || ''}`.toLowerCase();
        if (!q || text.includes(q)) {
          const parentInvTitle = invTitleMap.get(exp.investigationId) || 'Active Investigation';
          items.push({
            id: exp.id,
            type: 'experiment',
            title: exp.title,
            subtitle: `In: ${parentInvTitle} • Outcome: ${exp.outcome.toUpperCase()} • ${exp.objective}`,
            badgeText: exp.outcome,
            badgeType: 'experiment',
            investigationId: exp.investigationId,
            originalItem: exp,
          });
        }
      });
    }

    // 5. Decisions
    if (activeCategory === 'all' || activeCategory === 'decisions') {
      decisions.forEach((dec) => {
        const text = `${dec.title || ''} ${dec.decision || ''} ${dec.rationale || ''} ${dec.status || ''}`.toLowerCase();
        if (!q || text.includes(q)) {
          const parentInvTitle = invTitleMap.get(dec.investigationId) || 'Active Investigation';
          items.push({
            id: dec.id,
            type: 'decision',
            title: dec.title,
            subtitle: `In: ${parentInvTitle} • ${dec.decision.slice(0, 90)}...`,
            badgeText: dec.status,
            badgeType: 'decision',
            investigationId: dec.investigationId,
            originalItem: dec,
          });
        }
      });
    }

    return items;
  }, [query, activeCategory, investigations, claims, evidence, experiments, decisions]);

  // Counts for tabs
  const categoryCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    const countInv = investigations.filter((inv) =>
      !q || `${inv.title || ''} ${inv.question || ''} ${inv.environment || ''}`.toLowerCase().includes(q)
    ).length;

    const countClaims = claims.filter((c) =>
      !q || `${c.statement || ''} ${c.status || ''} ${c.importance || ''}`.toLowerCase().includes(q)
    ).length;

    const countEv = evidence.filter((e) =>
      !q || `${e.title || ''} ${e.excerpt || ''} ${e.sourceType || ''}`.toLowerCase().includes(q)
    ).length;

    const countExp = experiments.filter((e) =>
      !q || `${e.title || ''} ${e.objective || ''} ${e.commandOrProcedure || ''}`.toLowerCase().includes(q)
    ).length;

    const countDec = decisions.filter((d) =>
      !q || `${d.title || ''} ${d.decision || ''} ${d.rationale || ''}`.toLowerCase().includes(q)
    ).length;

    return {
      all: countInv + countClaims + countEv + countExp + countDec,
      investigations: countInv,
      claims: countClaims,
      evidence: countEv,
      experiments: countExp,
      decisions: countDec,
    };
  }, [query, investigations, claims, evidence, experiments, decisions]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length, query, activeCategory]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        const item = searchResults[selectedIndex];
        onSelectResult(item.type, item.id, item.investigationId);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Auto scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'investigation':
        return <SearchCode size={16} className="text-cyan-400" />;
      case 'claim':
        return <ShieldAlert size={16} className="text-amber-400" />;
      case 'evidence':
        return <FileText size={16} className="text-emerald-400" />;
      case 'experiment':
        return <FlaskConical size={16} className="text-purple-400" />;
      case 'decision':
        return <CheckSquare size={16} className="text-blue-400" />;
    }
  };

  const categories: { id: SearchCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Results', count: categoryCounts.all },
    { id: 'investigations', label: 'Investigations', count: categoryCounts.investigations },
    { id: 'claims', label: 'Claims', count: categoryCounts.claims },
    { id: 'evidence', label: 'Evidence', count: categoryCounts.evidence },
    { id: 'experiments', label: 'Experiments', count: categoryCounts.experiments },
    { id: 'decisions', label: 'Decisions', count: categoryCounts.decisions },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      {/* Modal Card */}
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[80vh] border-cyan-500/20"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/90">
          <Search size={20} className="text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search investigations, claims, evidence, experiments, or decisions..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base font-sans focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-md"
              title="Clear search query"
            >
              <X size={16} />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-500 border border-slate-800 bg-slate-900 px-2 py-1 rounded">
            <kbd>ESC</kbd> to close
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeCategory === cat.id ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-950 text-slate-500'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="p-2 overflow-y-auto max-h-[55vh] space-y-1 divide-y divide-slate-800/40"
        >
          {searchResults.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mx-auto">
                <Search size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">No matching engineering artifacts found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search terms or selecting a different category filter.
                </p>
              </div>
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onSelectResult(item.type, item.id, item.investigationId);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/50 border border-cyan-500/40 text-slate-100 shadow-md'
                      : 'hover:bg-slate-800/50 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
                          {item.type}
                        </span>
                        {item.badgeText && (
                          item.badgeType === 'epistemic' ? (
                            <EpistemicBadge status={item.badgeText as any} size="sm" />
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                              {item.badgeText}
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 flex items-center text-slate-500">
                    {isSelected ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                        <span>Select</span>
                        <CornerDownLeft size={12} />
                      </div>
                    ) : (
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer / Shortcuts */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500 px-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">↵</kbd> select
            </span>
          </div>
          <span>Showing {searchResults.length} results</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Evidence Section
 * Stores empirical citations, source code, official documentation, and technical excerpts
 */

import React from 'react';
import { Plus, ExternalLink, FileText, ShieldAlert, Award, Globe, Code2, Users } from 'lucide-react';
import { Claim, Evidence, EvidenceType } from '../../types';

interface EvidenceSectionProps {
  evidence: Evidence[];
  claims: Claim[];
  onOpenCreateEvidence: () => void;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  evidence,
  claims,
  onOpenCreateEvidence,
}) => {
  const getClaimStatement = (claimId: string) => {
    const claim = claims.find((c) => c.id === claimId);
    return claim ? claim.statement : claimId;
  };

  const typeConfig: Record<EvidenceType, { label: string; icon: any; style: string }> = {
    official_documentation: {
      label: 'Official Documentation',
      icon: Award,
      style: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
    },
    experiment: {
      label: 'Empirical Test Run',
      icon: Code2,
      style: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300',
    },
    source_code: {
      label: 'Source / Decompiled Code',
      icon: Code2,
      style: 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300',
    },
    github: {
      label: 'GitHub Issue/Commit',
      icon: Globe,
      style: 'bg-slate-900 border-slate-700 text-slate-300',
    },
    stackoverflow: {
      label: 'StackOverflow',
      icon: Globe,
      style: 'bg-orange-950/60 border-orange-500/40 text-orange-300',
    },
    web_article: {
      label: 'Web Article',
      icon: Globe,
      style: 'bg-slate-900 border-slate-700 text-slate-400',
    },
    agent_reasoning: {
      label: 'Agent Reasoning (AI Deduction)',
      icon: ShieldAlert,
      style: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
    },
    user_report: {
      label: 'User Report',
      icon: Users,
      style: 'bg-slate-900 border-slate-700 text-slate-400',
    },
  };

  const reliabilityBadge = (reliability: Evidence['reliability']) => {
    const styles = {
      high: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      medium: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      low: 'bg-slate-900 text-slate-400 border-slate-700',
      unverified: 'bg-slate-900 text-slate-500 border-slate-800',
    }[reliability];

    return (
      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${styles}`}>
        Reliability: {reliability}
      </span>
    );
  };

  return (
    <section
      id="section-evidence"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Step 3 of 6 // Empirical Evidence
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              {evidence.length} {evidence.length === 1 ? 'Artifact' : 'Artifacts'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Evidence Repository
          </h2>
          <p className="text-xs text-slate-400">
            Authoritative documentation, runtime observations, and citations. Agent reasoning is explicitly capped in reliability.
          </p>
        </div>

        <button
          id="btn-open-create-evidence"
          onClick={onOpenCreateEvidence}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          Add Evidence
        </button>
      </div>

      {evidence.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg p-6 space-y-2">
          <p className="text-sm text-slate-400">
            No evidentiary artifacts logged for this investigation.
          </p>
          <button
            onClick={onOpenCreateEvidence}
            className="text-xs text-cyan-400 hover:underline font-medium"
          >
            Attach documentation excerpts, runtime traces, or code references to substantiate claims.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.map((ev) => {
            const typeInfo = typeConfig[ev.type] || {
              label: ev.type,
              icon: FileText,
              style: 'bg-slate-900 border-slate-700 text-slate-300',
            };
            const Icon = typeInfo.icon;

            return (
              <div
                key={ev.id}
                id={`card-evidence-${ev.id}`}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border font-medium ${typeInfo.style}`}
                    >
                      <Icon size={12} />
                      {typeInfo.label}
                    </span>
                    {reliabilityBadge(ev.reliability)}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 flex items-center justify-between gap-2">
                    <span>{ev.title}</span>
                    {ev.sourceUrl && (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 shrink-0 p-1 rounded hover:bg-slate-900"
                        title={ev.sourceUrl}
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </h3>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                    "{ev.excerpt}"
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  {ev.relatedClaimIds && ev.relatedClaimIds.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-slate-500 font-mono text-[10px] uppercase">
                        Substantiates:
                      </span>
                      <div className="space-y-0.5">
                        {ev.relatedClaimIds.map((cId) => (
                          <div
                            key={cId}
                            className="font-mono text-cyan-300 line-clamp-1 bg-slate-900/40 px-1.5 py-0.5 rounded border border-slate-800/60"
                          >
                            • {getClaimStatement(cId)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>Source: {ev.sourceType || 'Document'}</span>
                    <span>By {ev.collectedBy?.name || 'Engineer'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

/**
 * Claims Section
 * First-class engineering objects display and management
 */

import React from 'react';
import {
  Plus,
  AlertTriangle,
  FilePlus2,
  FlaskConical,
  MessageSquare,
  MessageSquarePlus,
  ShieldCheck,
  User,
  Bot,
} from 'lucide-react';
import { Claim } from '../../types';
import { EpistemicBadge } from '../common/EpistemicBadge';

interface ClaimsSectionProps {
  claims: Claim[];
  onOpenCreateClaim: () => void;
  onOpenChallengeClaim: (claim: Claim) => void;
  onOpenAddArgument: (claim: Claim) => void;
  onOpenCreateEvidenceForClaim: (claimId: string) => void;
  onOpenCreateExperimentForClaim: (claimId: string) => void;
}

export const ClaimsSection: React.FC<ClaimsSectionProps> = ({
  claims,
  onOpenCreateClaim,
  onOpenChallengeClaim,
  onOpenAddArgument,
  onOpenCreateEvidenceForClaim,
  onOpenCreateExperimentForClaim,
}) => {
  return (
    <section
      id="section-claims"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              Step 2 of 6 // Claims Formulation
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-1">
            Engineering Claims
          </h2>
          <p className="text-xs text-slate-400">
            Falsifiable technical assertions. AI assertions are unverified hypotheses until proven by experiments.
          </p>
        </div>

        <button
          id="btn-open-create-claim"
          onClick={onOpenCreateClaim}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          Create Claim
        </button>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg p-6 space-y-2">
          <p className="text-sm text-slate-400">
            No claims recorded yet for this investigation.
          </p>
          <button
            onClick={onOpenCreateClaim}
            className="text-xs text-cyan-400 hover:underline font-medium"
          >
            Create the first falsifiable claim or run Gemini analysis to extract hypotheses.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {claims.map((claim) => {
            const hasChallenges = claim.challenges && claim.challenges.length > 0;
            const evidenceCount = claim.relatedEvidenceIds ? claim.relatedEvidenceIds.length : 0;
            const experimentCount = claim.relatedExperimentIds ? claim.relatedExperimentIds.length : 0;
            const argumentsCount = claim.arguments ? claim.arguments.length : 0;

            return (
              <div
                key={claim.id}
                id={`card-claim-${claim.id}`}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 space-y-4 transition-all"
              >
                {/* Header: Epistemic Status Badge, Importance, Attribution */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <EpistemicBadge status={claim.status} size="md" />
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                      Importance: {claim.importance}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    {claim.createdBy.type === 'agent' ? (
                      <span className="inline-flex items-center gap-1 text-cyan-300 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                        <Bot size={13} />
                        Proposed by: {claim.createdBy.name} ({claim.createdBy.role || 'Agent'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        <User size={13} />
                        Proposed by: {claim.createdBy.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* The Claim Statement */}
                <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800/80 font-mono text-sm text-slate-100 font-medium leading-relaxed">
                  "{claim.statement}"
                </div>

                {/* Metrics Rail: Challenges, Evidence, Experiments */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400 font-mono">Challenges:</span>
                    <span
                      className={`font-mono font-bold ${
                        hasChallenges ? 'text-orange-400' : 'text-slate-500'
                      }`}
                    >
                      {hasChallenges ? `${claim.challenges.length} active` : 'None'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400 font-mono">Evidence:</span>
                    <span
                      className={`font-mono font-bold ${
                        evidenceCount > 0 ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    >
                      {evidenceCount} attached
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400 font-mono">Experiments:</span>
                    <span
                      className={`font-mono font-bold ${
                        experimentCount > 0 ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {experimentCount} test(s)
                    </span>
                  </div>
                </div>

                {/* Active Challenges Display */}
                {hasChallenges && (
                  <div className="space-y-2 bg-orange-950/20 border border-orange-500/30 p-3 rounded-lg text-xs">
                    <span className="font-semibold text-orange-300 flex items-center gap-1.5 font-mono">
                      <AlertTriangle size={14} className="text-orange-400" />
                      Active Adversarial Challenges:
                    </span>
                    <div className="space-y-1.5">
                      {claim.challenges.map((ch) => (
                        <div key={ch.id} className="text-orange-200/90 pl-3 border-l-2 border-orange-500/50">
                          <p>"{ch.challenge}"</p>
                          <span className="text-[10px] text-orange-400/80 font-mono">
                            — {ch.challenger} ({ch.role})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supporting Arguments Display */}
                {argumentsCount > 0 && (
                  <div className="space-y-1.5 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1">
                      <MessageSquare size={13} />
                      Arguments ({argumentsCount}):
                    </span>
                    <div className="space-y-1">
                      {claim.arguments.map((arg) => (
                        <div key={arg.id} className="text-slate-300 text-xs pl-2.5 border-l-2 border-slate-700">
                          <span
                            className={`font-mono text-[10px] mr-1.5 px-1 rounded uppercase ${
                              arg.type === 'pro'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {arg.type}
                          </span>
                          <span>{arg.text}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                            ({arg.author})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons as requested:
                    [Create Evidence] [Challenge Claim] [Create Experiment] [Add Argument] */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    id={`btn-create-evidence-${claim.id}`}
                    onClick={() => onOpenCreateEvidenceForClaim(claim.id)}
                    className="px-3 py-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FilePlus2 size={13} />
                    Create Evidence
                  </button>

                  <button
                    id={`btn-challenge-claim-${claim.id}`}
                    onClick={() => onOpenChallengeClaim(claim)}
                    className="px-3 py-1.5 bg-orange-950/50 hover:bg-orange-900/60 border border-orange-500/40 text-orange-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle size={13} />
                    Challenge Claim
                  </button>

                  <button
                    id={`btn-create-exp-${claim.id}`}
                    onClick={() => onOpenCreateExperimentForClaim(claim.id)}
                    className="px-3 py-1.5 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <FlaskConical size={13} />
                    Create Experiment
                  </button>

                  <button
                    id={`btn-add-arg-${claim.id}`}
                    onClick={() => onOpenAddArgument(claim)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto"
                  >
                    <MessageSquarePlus size={13} />
                    Add Argument
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

/**
 * Claims List View
 */

import React, { useState } from 'react';
import { Claim, EpistemicStatus } from '../../types';
import { ClaimsSection } from '../investigation/ClaimsSection';
import { EpistemicBadge } from '../common/EpistemicBadge';

interface ClaimsListViewProps {
  claims: Claim[];
  onOpenCreateClaim: (defaultStatement?: string, defaultRationale?: string) => void;
  onOpenChallengeClaim: (claim: Claim) => void;
  onOpenAddArgument: (claim: Claim) => void;
  onOpenCreateEvidenceForClaim: (claimId: string) => void;
  onOpenCreateExperimentForClaim: (claimId: string) => void;
}

export const ClaimsListView: React.FC<ClaimsListViewProps> = ({
  claims,
  onOpenCreateClaim,
  onOpenChallengeClaim,
  onOpenAddArgument,
  onOpenCreateEvidenceForClaim,
  onOpenCreateExperimentForClaim,
}) => {
  const [filter, setFilter] = useState<'all' | EpistemicStatus>('all');

  const filteredClaims =
    filter === 'all' ? claims : claims.filter((c) => c.status === filter);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Epistemic Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <span className="text-xs font-mono text-slate-400 mr-2">Filter by Status:</span>
        {(
          [
            'all',
            'verified',
            'unverified',
            'supported',
            'disputed',
            'disproved',
            'unknown',
          ] as const
        ).map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => setFilter(statusKey)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors uppercase ${
              filter === statusKey
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {statusKey === 'all' ? 'All Claims' : statusKey}
          </button>
        ))}
      </div>

      <ClaimsSection
        claims={filteredClaims}
        onOpenCreateClaim={() => onOpenCreateClaim()}
        onOpenChallengeClaim={onOpenChallengeClaim}
        onOpenAddArgument={onOpenAddArgument}
        onOpenCreateEvidenceForClaim={onOpenCreateEvidenceForClaim}
        onOpenCreateExperimentForClaim={onOpenCreateExperimentForClaim}
      />
    </div>
  );
};

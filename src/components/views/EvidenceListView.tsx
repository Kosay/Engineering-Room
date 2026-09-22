/**
 * Evidence List View
 */

import React from 'react';
import { Claim, Evidence } from '../../types';
import { EvidenceSection } from '../investigation/EvidenceSection';

interface EvidenceListViewProps {
  evidence: Evidence[];
  claims: Claim[];
  onOpenCreateEvidence: () => void;
}

export const EvidenceListView: React.FC<EvidenceListViewProps> = ({
  evidence,
  claims,
  onOpenCreateEvidence,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <EvidenceSection
        evidence={evidence}
        claims={claims}
        onOpenCreateEvidence={onOpenCreateEvidence}
      />
    </div>
  );
};

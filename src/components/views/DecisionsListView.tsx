/**
 * Decisions List View
 */

import React from 'react';
import { Claim, Decision, Evidence, Experiment } from '../../types';
import { DecisionSection } from '../investigation/DecisionSection';

interface DecisionsListViewProps {
  decisions: Decision[];
  claims: Claim[];
  evidence: Evidence[];
  experiments: Experiment[];
  onOpenCreateDecision: () => void;
  onApproveDecision: (decisionId: string) => Promise<void>;
}

export const DecisionsListView: React.FC<DecisionsListViewProps> = ({
  decisions,
  claims,
  evidence,
  experiments,
  onOpenCreateDecision,
  onApproveDecision,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <DecisionSection
        decisions={decisions}
        claims={claims}
        evidence={evidence}
        experiments={experiments}
        onOpenCreateDecision={onOpenCreateDecision}
        onApproveDecision={onApproveDecision}
      />
    </div>
  );
};

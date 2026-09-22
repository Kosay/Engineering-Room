/**
 * Experiments List View
 */

import React from 'react';
import { Claim, Experiment } from '../../types';
import { ExperimentsSection } from '../investigation/ExperimentsSection';

interface ExperimentsListViewProps {
  experiments: Experiment[];
  claims: Claim[];
  onOpenCreateExperiment: () => void;
  onOpenRecordResult: (experiment: Experiment) => void;
}

export const ExperimentsListView: React.FC<ExperimentsListViewProps> = ({
  experiments,
  claims,
  onOpenCreateExperiment,
  onOpenRecordResult,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ExperimentsSection
        experiments={experiments}
        claims={claims}
        onOpenCreateExperiment={onOpenCreateExperiment}
        onOpenRecordResult={onOpenRecordResult}
      />
    </div>
  );
};

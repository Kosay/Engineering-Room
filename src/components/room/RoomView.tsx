/**
 * Engineering Room View
 * 
 * Displays the full room dashboard:
 * 1. Current investigation
 * 2. Original question
 * 3. Investigation phase
 * 4. Agent discussion
 * 5. Claims
 * 6. Evidence
 * 7. Experiments
 * 8. Current decision status
 */

import React from 'react';
import {
  EngineeringRoom,
  Investigation,
  Claim,
  Evidence,
  Experiment,
  Decision,
  AgentMessage,
  InvestigationPhase,
  EpistemicStatus,
  AgentRole,
} from '../../types';
import { InvestigationWorkspace } from '../investigation/InvestigationWorkspace';
import {
  Cpu,
  SearchCode,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  CheckSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { EpistemicBadge } from '../common/EpistemicBadge';
import { PhaseBadge } from '../common/PhaseBadge';

interface RoomViewProps {
  room: EngineeringRoom;
  investigations: Investigation[];
  activeInvestigation: Investigation | null;
  claims: Claim[];
  evidence: Evidence[];
  experiments: Experiment[];
  decisions: Decision[];
  messages: AgentMessage[];
  onSelectInvestigation: (inv: Investigation) => void;
  onOpenCreateInvestigation: () => void;
  onPhaseChange: (phase: InvestigationPhase) => void;
  onOpenCreateClaim: (defaultStatement?: string, defaultRationale?: string) => void;
  onOpenChallengeClaim: (claim: Claim) => void;
  onOpenAddArgument: (claim: Claim) => void;
  onOpenCreateEvidence: (preselectedClaimId?: string) => void;
  onOpenCreateExperiment: (preselectedClaimId?: string) => void;
  onOpenRecordResult: (experiment: Experiment) => void;
  onOpenCreateDecision: () => void;
  onApproveDecision: (decisionId: string) => Promise<void>;
  onReconcileAll: () => Promise<void>;
  onUpdateClaimStatus: (claimId: string, newStatus: EpistemicStatus) => Promise<void>;
  onSendMessage: (role: AgentRole, content: string) => Promise<void>;
  onRunGeminiAnalysis: (role: AgentRole) => Promise<void>;
}

export const RoomView: React.FC<RoomViewProps> = ({
  room,
  investigations,
  activeInvestigation,
  claims,
  evidence,
  experiments,
  decisions,
  messages,
  onSelectInvestigation,
  onOpenCreateInvestigation,
  onPhaseChange,
  onOpenCreateClaim,
  onOpenChallengeClaim,
  onOpenAddArgument,
  onOpenCreateEvidence,
  onOpenCreateExperiment,
  onOpenRecordResult,
  onOpenCreateDecision,
  onApproveDecision,
  onReconcileAll,
  onUpdateClaimStatus,
  onSendMessage,
  onRunGeminiAnalysis,
}) => {
  if (!activeInvestigation) {
    return (
      <div className="p-8 text-center space-y-4 max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <SearchCode size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-100">No Active Investigation</h2>
        <p className="text-xs text-slate-400">
          This engineering room currently has no registered investigations. Initialize one to start questioning, formulating claims, and executing experiments.
        </p>
        <button
          onClick={onOpenCreateInvestigation}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
        >
          Initialize First Investigation
        </button>
      </div>
    );
  }

  // Active Decision status preview
  const activeDecision = decisions[0];

  return (
    <div id="room-dashboard" className="space-y-6">
      {/* Investigation Switcher Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Active Investigation:</span>
          <select
            id="select-active-investigation"
            value={activeInvestigation.id}
            onChange={(e) => {
              const inv = investigations.find((i) => i.id === e.target.value);
              if (inv) onSelectInvestigation(inv);
            }}
            className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            {investigations.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.title} [{inv.phase}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            Room: <strong className="text-slate-200">{room.name}</strong>
          </span>
          <button
            onClick={onOpenCreateInvestigation}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
          >
            + New Investigation
          </button>
        </div>
      </div>

      {/* Main 6-Step Epistemic Investigation Workspace */}
      <InvestigationWorkspace
        investigation={activeInvestigation}
        claims={claims}
        evidence={evidence}
        experiments={experiments}
        decisions={decisions}
        messages={messages}
        onPhaseChange={onPhaseChange}
        onOpenCreateClaim={onOpenCreateClaim}
        onOpenChallengeClaim={onOpenChallengeClaim}
        onOpenAddArgument={onOpenAddArgument}
        onOpenCreateEvidence={onOpenCreateEvidence}
        onOpenCreateExperiment={onOpenCreateExperiment}
        onOpenRecordResult={onOpenRecordResult}
        onOpenCreateDecision={onOpenCreateDecision}
        onApproveDecision={onApproveDecision}
        onReconcileAll={onReconcileAll}
        onUpdateClaimStatus={onUpdateClaimStatus}
        onSendMessage={onSendMessage}
        onRunGeminiAnalysis={onRunGeminiAnalysis}
      />
    </div>
  );
};

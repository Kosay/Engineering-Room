/**
 * Investigation Workspace
 * 
 * Pipeline:
 * QUESTION
 *    ↓
 * CLAIMS
 *    ↓
 * EVIDENCE
 *    ↓
 * EXPERIMENTS
 *    ↓
 * RECONCILIATION
 *    ↓
 * DECISION
 */

import React, { useState } from 'react';
import {
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
import { QuestionSection } from './QuestionSection';
import { ClaimsSection } from './ClaimsSection';
import { EvidenceSection } from './EvidenceSection';
import { ExperimentsSection } from './ExperimentsSection';
import { ReconciliationSection } from './ReconciliationSection';
import { DecisionSection } from './DecisionSection';
import { AgentDiscussionPanel } from './AgentDiscussionPanel';
import {
  HelpCircle,
  ShieldAlert,
  FileText,
  FlaskConical,
  GitMerge,
  CheckSquare,
  ArrowDown,
  Layers,
} from 'lucide-react';

interface InvestigationWorkspaceProps {
  investigation: Investigation;
  claims: Claim[];
  evidence: Evidence[];
  experiments: Experiment[];
  decisions: Decision[];
  messages: AgentMessage[];
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

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  investigation,
  claims,
  evidence,
  experiments,
  decisions,
  messages,
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
  const [activeSectionFilter, setActiveSectionFilter] = useState<'all' | 'question' | 'claims' | 'evidence' | 'experiments' | 'reconciliation' | 'decisions'>('all');
  const [isAgentDiscussionOpen, setIsAgentDiscussionOpen] = useState(true);

  const handlePromoteStatementToClaim = (statement: string, rationale: string) => {
    onOpenCreateClaim(statement, rationale);
  };

  const navItems = [
    { id: 'all', label: 'Complete Pipeline', icon: Layers, count: null },
    { id: 'question', label: '1. Question', icon: HelpCircle, count: null },
    { id: 'claims', label: '2. Claims', icon: ShieldAlert, count: claims.length },
    { id: 'evidence', label: '3. Evidence', icon: FileText, count: evidence.length },
    { id: 'experiments', label: '4. Experiments', icon: FlaskConical, count: experiments.length },
    { id: 'reconciliation', label: '5. Reconciliation', icon: GitMerge, count: null },
    { id: 'decisions', label: '6. Decisions', icon: CheckSquare, count: decisions.length },
  ] as const;

  return (
    <div id="investigation-workspace" className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Section Filter Pills for independent section viewing */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSectionFilter === item.id;
          return (
            <button
              key={item.id}
              id={`nav-pipeline-${item.id}`}
              onClick={() => setActiveSectionFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon size={13} />
              <span>{item.label}</span>
              {item.count !== null && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* QUESTION SECTION */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'question') && (
        <div className="space-y-3">
          <QuestionSection
            investigation={investigation}
            onPhaseChange={onPhaseChange}
            onOpenAgentAnalysis={() => {
              setIsAgentDiscussionOpen(true);
              onRunGeminiAnalysis('Architect');
            }}
          />
          {activeSectionFilter === 'all' && (
            <div className="flex justify-center py-1 text-slate-600">
              <ArrowDown size={18} className="animate-bounce" />
            </div>
          )}
        </div>
      )}

      {/* AI Agent Discussion Panel */}
      <AgentDiscussionPanel
        messages={messages}
        investigationQuestion={investigation.question}
        environment={investigation.environment}
        claims={claims}
        onSendMessage={onSendMessage}
        onRunGeminiAnalysis={onRunGeminiAnalysis}
        onPromoteStatementToClaim={handlePromoteStatementToClaim}
        isOpen={isAgentDiscussionOpen}
        onToggle={() => setIsAgentDiscussionOpen(!isAgentDiscussionOpen)}
      />

      {/* CLAIMS SECTION */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'claims') && (
        <div className="space-y-3">
          {activeSectionFilter === 'all' && (
            <div className="flex justify-center py-1 text-slate-600">
              <ArrowDown size={18} />
            </div>
          )}
          <ClaimsSection
            claims={claims}
            onOpenCreateClaim={() => onOpenCreateClaim()}
            onOpenChallengeClaim={onOpenChallengeClaim}
            onOpenAddArgument={onOpenAddArgument}
            onOpenCreateEvidenceForClaim={(cId) => onOpenCreateEvidence(cId)}
            onOpenCreateExperimentForClaim={(cId) => onOpenCreateExperiment(cId)}
          />
        </div>
      )}

      {/* EVIDENCE SECTION */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'evidence') && (
        <div className="space-y-3">
          {activeSectionFilter === 'all' && (
            <div className="flex justify-center py-1 text-slate-600">
              <ArrowDown size={18} />
            </div>
          )}
          <EvidenceSection
            evidence={evidence}
            claims={claims}
            onOpenCreateEvidence={() => onOpenCreateEvidence()}
          />
        </div>
      )}

      {/* EXPERIMENTS SECTION */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'experiments') && (
        <div className="space-y-3">
          {activeSectionFilter === 'all' && (
            <div className="flex justify-center py-1 text-slate-600">
              <ArrowDown size={18} />
            </div>
          )}
          <ExperimentsSection
            experiments={experiments}
            claims={claims}
            onOpenCreateExperiment={() => onOpenCreateExperiment()}
            onOpenRecordResult={onOpenRecordResult}
          />
        </div>
      )}

      {/* RECONCILIATION SECTION */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'reconciliation') && (
        <div className="space-y-3">
          {activeSectionFilter === 'all' && (
            <div className="flex justify-center py-1 text-slate-600">
              <ArrowDown size={18} />
            </div>
          )}
          <ReconciliationSection
            claims={claims}
            evidence={evidence}
            experiments={experiments}
            onReconcileAll={onReconcileAll}
            onUpdateClaimStatus={onUpdateClaimStatus}
          />
        </div>
      )}

      {/* DECISION SECTION */}
      {(activeSectionFilter === 'all' || activeSectionFilter === 'decisions') && (
        <div className="space-y-3">
          {activeSectionFilter === 'all' && (
            <div className="flex justify-center py-1 text-slate-600">
              <ArrowDown size={18} />
            </div>
          )}
          <DecisionSection
            decisions={decisions}
            claims={claims}
            evidence={evidence}
            experiments={experiments}
            onOpenCreateDecision={onOpenCreateDecision}
            onApproveDecision={onApproveDecision}
          />
        </div>
      )}
    </div>
  );
};

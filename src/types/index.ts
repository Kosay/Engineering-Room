/**
 * KMH AI Engineering Room
 * Domain Types and Epistemic State Machine
 */

export type EpistemicStatus = 'unverified' | 'supported' | 'disputed' | 'disproved' | 'verified' | 'unknown';

export type InvestigationPhase =
  | 'question'
  | 'analysis'
  | 'debate'
  | 'evidence'
  | 'experiment'
  | 'reconciliation'
  | 'decision'
  | 'implementation'
  | 'completed';

export type InvestigationPriority = 'low' | 'medium' | 'high' | 'critical';

export type EvidenceType =
  | 'official_documentation'
  | 'github'
  | 'source_code'
  | 'web_article'
  | 'stackoverflow'
  | 'agent_reasoning'
  | 'user_report'
  | 'experiment';

export type EvidenceReliability = 'high' | 'medium' | 'low' | 'unverified';

export type ExperimentStatus = 'draft' | 'ready' | 'running' | 'completed' | 'abandoned';

export type ExperimentOutcome = 'passed' | 'failed' | 'partial' | 'inconclusive' | 'not_run';

export type DecisionStatus = 'draft' | 'proposed' | 'approved' | 'rejected' | 'superseded';

export type AgentRole =
  | 'Architect'
  | 'Adversarial Reviewer'
  | 'Independent Analyst'
  | 'Evidence Researcher'
  | 'Experiment Agent'
  | 'Implementation Agent'
  | 'Human Engineer';

export type AIProviderId = 'gemini' | 'openai' | 'anthropic' | 'deepseek';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
}

export interface EngineeringRoom {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  projectTarget: string; // e.g. "WPS AI (.NET 8 WPF)"
  createdAt: string;
  updatedAt: string;
  activeInvestigationId?: string;
}

export interface Investigation {
  id: string;
  organizationId: string;
  roomId: string;
  title: string;
  question: string;
  status: 'active' | 'archived' | 'concluded';
  phase: InvestigationPhase;
  priority: InvestigationPriority;
  environment: string; // e.g. "Windows 11 x64, .NET 8, WPS Office v12.1.0"
  participatingAgents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimArgument {
  id: string;
  author: string;
  role: AgentRole;
  text: string;
  type: 'pro' | 'contra';
  timestamp: string;
}

export interface ClaimChallenge {
  id: string;
  challenger: string;
  role: AgentRole;
  challenge: string;
  timestamp: string;
}

export interface Claim {
  id: string;
  organizationId: string;
  roomId: string;
  investigationId: string;
  statement: string;
  status: EpistemicStatus;
  importance: 'critical' | 'high' | 'medium' | 'low';
  createdBy: {
    id: string;
    name: string;
    type: 'human' | 'agent';
    provider?: AIProviderId;
    role?: AgentRole;
  };
  arguments: ClaimArgument[];
  challenges: ClaimChallenge[];
  relatedEvidenceIds: string[];
  relatedExperimentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  organizationId: string;
  roomId: string;
  investigationId: string;
  type: EvidenceType;
  title: string;
  sourceUrl?: string;
  sourceType: string;
  excerpt: string;
  reliability: EvidenceReliability;
  relatedClaimIds: string[];
  collectedBy: {
    id: string;
    name: string;
    type: 'human' | 'agent';
    role?: AgentRole;
  };
  timestamp: string;
}

export interface ExperimentArtifact {
  id: string;
  name: string;
  type: 'log' | 'code' | 'screenshot' | 'output';
  contentOrUrl: string;
}

export interface Experiment {
  id: string;
  organizationId: string;
  roomId: string;
  investigationId: string;
  title: string;
  objective: string;
  status: ExperimentStatus;
  environment: string;
  commandOrProcedure: string;
  expectedResult: string;
  actualResult?: string;
  outcome: ExperimentOutcome;
  relatedClaimIds: string[];
  artifacts: ExperimentArtifact[];
  executionTimestamp?: string;
  executedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  organizationId: string;
  roomId: string;
  investigationId: string;
  title: string;
  decision: string;
  status: DecisionStatus;
  rationale: string;
  relatedClaimIds: string[];
  relatedEvidenceIds: string[];
  relatedExperimentIds: string[];
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestigationMessage {
  id: string;
  organizationId: string;
  roomId: string;
  investigationId: string;
  sender: {
    id: string;
    name: string;
    role: AgentRole;
    type: 'human' | 'agent';
    provider?: AIProviderId;
  };
  content: string;
  associatedClaimIds?: string[];
  associatedEvidenceIds?: string[];
  timestamp: string;
}

export interface AgentMessage {
  id: string;
  authorName: string;
  role: AgentRole;
  content: string;
  createdAt: string;
  associatedClaimIds?: string[];
  associatedEvidenceIds?: string[];
}


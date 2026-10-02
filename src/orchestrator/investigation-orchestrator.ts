/**
 * Investigation Orchestrator
 * Central coordinator for engineering investigations, multi-agent debates, and claim verification.
 */

import {
  AgentRole,
  AIProviderId,
  Claim,
  Decision,
  Evidence,
  Experiment,
  Investigation,
} from '../types';
import { ContextBuilder } from './context-builder';
import { AgentRunner } from './agent-runner';
import { ClaimManager } from './claim-manager';
import { DecisionManager, DecisionReadiness } from './decision-manager';
import { ProviderAnalysisResult } from '../providers/ai-provider.interface';
import { providerRegistry } from '../providers/provider-registry';


export interface AgentPanelResult {
  providerId: AIProviderId;
  role: AgentRole;
  status: 'completed' | 'failed';
  result?: ProviderAnalysisResult;
  error?: string;
}

export class InvestigationOrchestrator {
  /**
   * Runs an AI analysis for the investigation.
   * Proposes hypotheses that MUST start as [unverified] claims.
   */
  public static async executeAnalysis(
    investigation: Investigation,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[],
    providerId: AIProviderId = 'gemini',
    role: AgentRole = 'Architect'
  ): Promise<ProviderAnalysisResult> {
    const context = ContextBuilder.buildContext(
      investigation,
      claims,
      evidence,
      experiments
    );

    return await AgentRunner.runAgent(providerId, role, context);
  }

  /**
   * Runs independent analyses in parallel.
   * No provider is treated as authoritative; failures are preserved as explicit results.
   */
  public static async runIndependentPanel(
    investigation: Investigation,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[],
    providerIds?: AIProviderId[]
  ): Promise<AgentPanelResult[]> {
    const context = ContextBuilder.buildContext(
      investigation,
      claims,
      evidence,
      experiments
    );

    const requestedProviders = providerIds?.length
      ? providerIds
      : providerRegistry.getConnectedProviders().map((provider) => provider.id);

    if (requestedProviders.length === 0) {
      throw new Error('No connected AI providers are available for an independent panel.');
    }

    const jobs = requestedProviders.map(async (providerId): Promise<AgentPanelResult> => {
      const provider = providerRegistry.getProvider(providerId);
      const role = provider.supportedRoles.includes('Independent Analyst')
        ? 'Independent Analyst'
        : provider.supportedRoles[0];

      try {
        const result = await AgentRunner.runAgent(providerId, role, context);
        return { providerId, role, status: 'completed', result };
      } catch (error) {
        return {
          providerId,
          role,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    return await Promise.all(jobs);
  }

  /**
   * Runs the independent panel from authoritative Firestore state and persists
   * completed results into the canonical investigation subcollections.
   */
  public static async runAndPersistIndependentPanel(
    orgId: string,
    roomId: string,
    investigationId: string,
    providerIds?: AIProviderId[]
  ): Promise<AgentPanelResult[]> {
    const user = (await import('../lib/firebase')).getFirebaseAuth().currentUser;
    if (!user) throw new Error('Authentication is required for an independent panel.');
    const panelRunId = `panel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const response = await fetch('/api/ai/independent-panel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({ orgId, roomId, invId: investigationId, providerIds, panelRunId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok && !Array.isArray(payload.results)) {
      throw new Error(payload.error || 'Independent panel failed.');
    }
    return payload.results || [];
  }

  /**
   * Runs adversarial review against the persisted investigation state.
   */
  public static async runAdversarialReview(
    orgId: string,
    roomId: string,
    investigationId: string,
    providerIds?: AIProviderId[]
  ): Promise<AgentPanelResult[]> {
    const user = (await import('../lib/firebase')).getFirebaseAuth().currentUser;
    if (!user) throw new Error('Authentication is required for adversarial review.');
    const reviewRunId = `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const response = await fetch('/api/ai/adversarial-review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
      body: JSON.stringify({ orgId, roomId, invId: investigationId, providerIds, reviewRunId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok && !Array.isArray(payload.results)) {
      throw new Error(payload.error || 'Adversarial review failed.');
    }
    return payload.results || [];
  }

  /**
   * Reconciles all claims against attached evidence and test results.
   */
  public static reconcileClaims(
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[]
  ): Array<{
    claimId: string;
    oldStatus: string;
    newStatus: string;
    rationale: string;
  }> {
    return claims.map((claim) => {
      const attachedEvidence = evidence.filter((e) =>
        claim.relatedEvidenceIds.includes(e.id)
      );
      const attachedExperiments = experiments.filter((exp) =>
        claim.relatedExperimentIds.includes(exp.id)
      );

      const evaluation = ClaimManager.evaluateStatus(
        claim,
        attachedEvidence,
        attachedExperiments
      );

      return {
        claimId: claim.id,
        oldStatus: claim.status,
        newStatus: evaluation.recommendedStatus,
        rationale: evaluation.rationale,
      };
    });
  }

  /**
   * Runs the trusted reconciliation engine against authoritative Firestore state.
   * The server derives epistemic status and, when currently in reconciliation,
   * advances the investigation to the next lifecycle phase.
   */
  public static async reconcileInvestigation(
    orgId: string,
    roomId: string,
    investigationId: string
  ): Promise<{
    runId: string;
    changes: Array<{ claimId: string; oldStatus: Claim['status']; newStatus: Claim['status']; rationale: string }>;
    nextPhase: Investigation['phase'];
    phaseChanged: boolean;
  }> {
    const user = (await import('../lib/firebase')).getFirebaseAuth().currentUser;
    if (!user) throw new Error('Authentication is required for reconciliation.');

    const runId = 'reconcile-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const idToken = await user.getIdToken();
    const response = await fetch('/api/epistemic/reconcile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + idToken,
      },
      body: JSON.stringify({ orgId, roomId, invId: investigationId, runId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Investigation reconciliation failed.');
    }
    return payload;
  }

  /**
   * Validates whether a decision can be approved.
   */
  public static assessDecisionReadiness(
    decision: Decision,
    claims: Claim[],
    evidence: Evidence[],
    experiments: Experiment[]
  ): DecisionReadiness {
    return DecisionManager.evaluateDecisionReadiness(
      decision,
      claims,
      evidence,
      experiments
    );
  }
}

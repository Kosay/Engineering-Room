import assert from 'node:assert/strict';
import test from 'node:test';
import { ClaimManager } from '../src/orchestrator/claim-manager';
import { DecisionManager } from '../src/orchestrator/decision-manager';
import type { Claim, Decision, Evidence, Experiment } from '../src/types';

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    id: 'claim-1',
    organizationId: 'org-1',
    roomId: 'room-1',
    investigationId: 'inv-1',
    statement: 'Test claim',
    status: 'unverified',
    importance: 'high',
    createdBy: { id: 'user-1', name: 'Tester', type: 'human', role: 'Human Engineer' },
    arguments: [],
    challenges: [],
    relatedEvidenceIds: [],
    relatedExperimentIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function experiment(overrides: Partial<Experiment> = {}): Experiment {
  return {
    id: 'exp-1',
    organizationId: 'org-1',
    roomId: 'room-1',
    investigationId: 'inv-1',
    title: 'Test experiment',
    objective: 'Test',
    status: 'completed',
    environment: 'test',
    commandOrProcedure: 'run test',
    expectedResult: 'pass',
    outcome: 'not_run',
    relatedClaimIds: ['claim-1'],
    artifacts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function evidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: 'ev-1',
    organizationId: 'org-1',
    roomId: 'room-1',
    investigationId: 'inv-1',
    type: 'official_documentation',
    title: 'Official source',
    sourceType: 'official',
    excerpt: 'Authoritative evidence',
    reliability: 'high',
    relatedClaimIds: ['claim-1'],
    collectedBy: { id: 'user-1', name: 'Tester', type: 'human' },
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

test('raw claim remains unverified', () => {
  const result = ClaimManager.evaluateStatus(claim(), [], []);
  assert.equal(result.recommendedStatus, 'unverified');
});

test('conclusive passing experiment can verify a claim', () => {
  const result = ClaimManager.evaluateStatus(
    claim(),
    [],
    [experiment({ outcome: 'passed', actualResult: 'Observed expected result successfully.' })]
  );
  assert.equal(result.recommendedStatus, 'verified');
  assert.equal(result.canBeVerified, true);
});

test('conclusive failed experiment can disprove a claim', () => {
  const result = ClaimManager.evaluateStatus(
    claim(),
    [],
    [experiment({ outcome: 'failed', actualResult: 'Observed behavior contradicts the claim.' })]
  );
  assert.equal(result.recommendedStatus, 'disproved');
});

test('active challenge prevents verification', () => {
  const result = ClaimManager.evaluateStatus(
    claim({
      challenges: [{
        id: 'challenge-1',
        challenger: 'Reviewer',
        role: 'Adversarial Reviewer',
        challenge: 'Show reproducible evidence.',
        timestamp: new Date().toISOString(),
      }],
    }),
    [evidence()],
    []
  );
  assert.equal(result.recommendedStatus, 'disputed');
});

test('decision approval is blocked by unresolved claims', () => {
  const decision = {
    id: 'decision-1',
    organizationId: 'org-1',
    roomId: 'room-1',
    investigationId: 'inv-1',
    title: 'Test decision',
    decision: 'Use approach A',
    status: 'proposed',
    rationale: 'Test',
    relatedClaimIds: ['claim-1'],
    relatedEvidenceIds: [],
    relatedExperimentIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Decision;

  const result = DecisionManager.evaluateDecisionReadiness(
    decision,
    [claim()],
    [],
    []
  );

  assert.equal(result.isReadyForApproval, false);
  assert.ok(result.blockers.length > 0);
});

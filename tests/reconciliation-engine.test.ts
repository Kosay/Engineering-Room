import test from 'node:test';
import assert from 'node:assert/strict';
import { ClaimManager } from '../src/orchestrator/claim-manager';
import type { Claim, Experiment, Evidence } from '../src/types';

function claim(overrides: Partial<Claim> = {}): Claim {
  return {
    id: 'claim-1',
    organizationId: 'org-1',
    roomId: 'room-1',
    investigationId: 'inv-1',
    statement: 'Test claim',
    status: 'unverified',
    importance: 'high',
    createdBy: { id: 'human', name: 'Engineer', type: 'human', role: 'Human Engineer' },
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
    title: 'Reproduction',
    objective: 'Test claim',
    status: 'completed',
    environment: 'test',
    commandOrProcedure: 'run test',
    expectedResult: 'pass',
    actualResult: 'The reproducible test returned the expected result successfully.',
    outcome: 'passed',
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
    sourceType: 'vendor',
    excerpt: 'Authoritative documentation supporting the claim.',
    reliability: 'high',
    relatedClaimIds: ['claim-1'],
    collectedBy: { id: 'human', name: 'Engineer', type: 'human', role: 'Human Engineer' },
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

test('reconciliation verifies a claim from a conclusive passed experiment', () => {
  const result = ClaimManager.evaluateStatus(claim(), [], [experiment()]);
  assert.equal(result.recommendedStatus, 'verified');
  assert.equal(result.canBeVerified, true);
});

test('reconciliation disproves a claim from a conclusive failed experiment', () => {
  const result = ClaimManager.evaluateStatus(
    claim(),
    [],
    [experiment({ outcome: 'failed', actualResult: 'The reproducible test failed and returned the documented counter-result.' })]
  );
  assert.equal(result.recommendedStatus, 'disproved');
  assert.equal(result.canBeVerified, false);
});

test('active adversarial challenges keep a claim disputed', () => {
  const result = ClaimManager.evaluateStatus(
    claim({ challenges: [{ id: 'ch-1', challenger: 'reviewer', role: 'Adversarial Reviewer', challenge: 'Counterexample exists.', timestamp: new Date().toISOString() }] }),
    [evidence()],
    [experiment()]
  );
  assert.equal(result.recommendedStatus, 'disputed');
  assert.equal(result.canBeVerified, false);
});

test('high-reliability non-agent evidence can verify a claim', () => {
  const result = ClaimManager.evaluateStatus(claim(), [evidence()], []);
  assert.equal(result.recommendedStatus, 'verified');
});

test('unsupported claim remains unverified', () => {
  const result = ClaimManager.evaluateStatus(claim(), [], []);
  assert.equal(result.recommendedStatus, 'unverified');
});

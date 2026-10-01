import test from 'node:test';
import assert from 'node:assert/strict';
import { InvestigationManager } from '../src/orchestrator/investigation-manager';

test('allows normal forward investigation transitions', () => {
  assert.equal(InvestigationManager.canTransition('question', 'analysis'), true);
  assert.equal(InvestigationManager.canTransition('analysis', 'debate'), true);
  assert.equal(InvestigationManager.canTransition('reconciliation', 'decision'), true);
});

test('rejects arbitrary phase jumps and backwards transitions', () => {
  assert.equal(InvestigationManager.canTransition('question', 'implementation'), false);
  assert.equal(InvestigationManager.canTransition('decision', 'analysis'), false);
  assert.throws(
    () => InvestigationManager.assertTransition('completed', 'question'),
    /Invalid investigation phase transition/
  );
});

test('allows explicit rework from reconciliation and decision stages', () => {
  assert.equal(InvestigationManager.canTransition('reconciliation', 'evidence'), true);
  assert.equal(InvestigationManager.canTransition('decision', 'reconciliation'), true);
});

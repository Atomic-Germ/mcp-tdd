import { describe, it, expect, beforeEach } from 'vitest';
import { TDDStateManager } from '../src/services/TDDStateManager.js';

describe('TDDStateManager', () => {
  let stateManager: TDDStateManager;

  beforeEach(() => {
    stateManager = new TDDStateManager();
  });

  describe('initCycle', () => {
    it('should initialize a new TDD cycle', () => {
      const cycle = stateManager.initCycle(
        'user-auth',
        'Implement user authentication',
        'vitest',
        'typescript',
      );

      expect(cycle).toBeDefined();
      expect(cycle.feature).toBe('user-auth');
      expect(cycle.description).toBe('Implement user authentication');
      expect(cycle.phase).toBe('red');
      expect(cycle.testFramework).toBe('vitest');
      expect(cycle.language).toBe('typescript');
      expect(cycle.tests).toEqual([]);
    });

    it('should set the cycle as current', () => {
      const cycle = stateManager.initCycle(
        'test-feature',
        'Test description',
        'jest',
        'javascript',
      );
      const current = stateManager.getCurrentCycle();

      expect(current).toBe(cycle);
    });
  });

  describe('addTest', () => {
    beforeEach(() => {
      stateManager.initCycle('test-feature', 'Test description', 'vitest', 'typescript');
    });

    it('should add a test to the current cycle', () => {
      const test = stateManager.addTest({
        name: 'should authenticate user',
        file: 'test/auth.test.ts',
        code: 'test code here',
        status: 'pending',
        expectedToFail: true,
      });

      expect(test).toBeDefined();
      expect(test.id).toBeDefined();
      expect(test.name).toBe('should authenticate user');

      const cycle = stateManager.getCurrentCycle();
      expect(cycle?.tests).toHaveLength(1);
      expect(cycle?.tests[0]).toBe(test);
    });

    it('should throw error if no active cycle', () => {
      const manager = new TDDStateManager();
      expect(() => {
        manager.addTest({
          name: 'test',
          file: 'test.ts',
          code: 'code',
          status: 'pending',
          expectedToFail: true,
        });
      }).toThrow('No active TDD cycle');
    });
  });

  describe('advancePhase', () => {
    beforeEach(() => {
      stateManager.initCycle('test-feature', 'Test description', 'vitest', 'typescript');
    });

    it('should advance phase from red to green', () => {
      stateManager.advancePhase('green');
      const cycle = stateManager.getCurrentCycle();
      expect(cycle?.phase).toBe('green');
    });

    it('should advance phase from green to refactor', () => {
      stateManager.advancePhase('green');
      stateManager.advancePhase('refactor');
      const cycle = stateManager.getCurrentCycle();
      expect(cycle?.phase).toBe('refactor');
    });
  });

  describe('createCheckpoint', () => {
    beforeEach(() => {
      stateManager.initCycle('test-feature', 'Test description', 'vitest', 'typescript');
    });

    it('should create a checkpoint with current state', () => {
      const checkpoint = stateManager.createCheckpoint('Before implementing feature');

      expect(checkpoint).toBeDefined();
      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.description).toBe('Before implementing feature');
      expect(checkpoint.phase).toBe('red');
      expect(checkpoint.state).toBeDefined();
    });

    it('should add checkpoint to current cycle', () => {
      stateManager.createCheckpoint('Test checkpoint');
      const cycle = stateManager.getCurrentCycle();
      expect(cycle?.checkpoints).toHaveLength(1);
    });
  });

  describe('rollbackToCheckpoint', () => {
    beforeEach(() => {
      stateManager.initCycle('test-feature', 'Test description', 'vitest', 'typescript');
    });

    it('should rollback to a checkpoint', () => {
      const checkpoint = stateManager.createCheckpoint('Initial state');
      stateManager.advancePhase('green');

      const success = stateManager.rollbackToCheckpoint(checkpoint.id);
      expect(success).toBe(true);

      const cycle = stateManager.getCurrentCycle();
      expect(cycle?.phase).toBe('red');
    });

    it('should return false for non-existent checkpoint', () => {
      const success = stateManager.rollbackToCheckpoint('non-existent-id');
      expect(success).toBe(false);
    });
  });

  describe('completeCycle', () => {
    beforeEach(() => {
      stateManager.initCycle('test-feature', 'Test description', 'vitest', 'typescript');
    });

    it('should complete the cycle and add to history', () => {
      const cycle = stateManager.getCurrentCycle();
      const completed = stateManager.completeCycle();

      expect(completed).toBe(cycle);
      expect(completed?.phase).toBe('complete');
      expect(stateManager.getCurrentCycle()).toBeNull();

      const history = stateManager.getCycleHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toBe(completed);
    });

    it('should return null if no active cycle', () => {
      const manager = new TDDStateManager();
      const completed = manager.completeCycle();
      expect(completed).toBeNull();
    });
  });
});

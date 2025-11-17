import { TDDCycle, TestCase, Checkpoint } from '../types/index.js';

export class TDDStateManager {
  private currentCycle: TDDCycle | null = null;
  private cycleHistory: TDDCycle[] = [];

  initCycle(
    feature: string,
    description: string,
    testFramework: string,
    language: string,
  ): TDDCycle {
    const cycle: TDDCycle = {
      id: this.generateId(),
      feature,
      description,
      phase: 'red',
      testFramework,
      language,
      createdAt: new Date(),
      tests: [],
      checkpoints: [],
    };

    this.currentCycle = cycle;
    return cycle;
  }

  getCurrentCycle(): TDDCycle | null {
    return this.currentCycle;
  }

  addTest(test: Omit<TestCase, 'id'>): TestCase {
    if (!this.currentCycle) {
      throw new Error('No active TDD cycle. Initialize a cycle first.');
    }

    const testCase: TestCase = {
      id: this.generateId(),
      ...test,
    };

    this.currentCycle.tests.push(testCase);
    return testCase;
  }

  updateTestStatus(testId: string, status: TestCase['status']): void {
    if (!this.currentCycle) {
      throw new Error('No active TDD cycle');
    }

    const test = this.currentCycle.tests.find(t => t.id === testId);
    if (test) {
      test.status = status;
    }
  }

  setImplementation(code: string): void {
    if (!this.currentCycle) {
      throw new Error('No active TDD cycle');
    }
    this.currentCycle.implementation = code;
  }

  advancePhase(newPhase: TDDCycle['phase']): void {
    if (!this.currentCycle) {
      throw new Error('No active TDD cycle');
    }
    this.currentCycle.phase = newPhase;
  }

  createCheckpoint(description: string): Checkpoint {
    if (!this.currentCycle) {
      throw new Error('No active TDD cycle');
    }

    const checkpoint: Checkpoint = {
      id: this.generateId(),
      timestamp: new Date(),
      phase: this.currentCycle.phase,
      description,
      state: JSON.parse(JSON.stringify(this.currentCycle)),
    };

    this.currentCycle.checkpoints.push(checkpoint);
    return checkpoint;
  }

  rollbackToCheckpoint(checkpointId: string): boolean {
    if (!this.currentCycle) {
      return false;
    }

    const checkpoint = this.currentCycle.checkpoints.find(c => c.id === checkpointId);
    if (checkpoint) {
      this.currentCycle = checkpoint.state;
      return true;
    }
    return false;
  }

  completeCycle(): TDDCycle | null {
    if (!this.currentCycle) {
      return null;
    }

    this.currentCycle.phase = 'complete';
    this.cycleHistory.push(this.currentCycle);
    const completed = this.currentCycle;
    this.currentCycle = null;
    return completed;
  }

  getCycleHistory(): TDDCycle[] {
    return [...this.cycleHistory];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

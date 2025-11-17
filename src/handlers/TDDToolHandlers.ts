import { TDDStateManager } from '../services/TDDStateManager.js';
import { TestRunner } from '../services/TestRunner.js';
import { writeFile, formatTestOutput, generateCycleSummary } from '../utils/fileUtils.js';

export class TDDToolHandlers {
  private stateManager: TDDStateManager;
  private testRunner: TestRunner;

  constructor(stateManager: TDDStateManager, testRunner: TestRunner) {
    this.stateManager = stateManager;
    this.testRunner = testRunner;
  }

  async handleInitCycle(args: any): Promise<string> {
    const { feature, description, testFramework = 'vitest', language = 'typescript' } = args;

    const cycle = this.stateManager.initCycle(feature, description, testFramework, language);

    return JSON.stringify(
      {
        success: true,
        message: 'TDD cycle initialized',
        cycle: {
          id: cycle.id,
          feature: cycle.feature,
          phase: cycle.phase,
          testFramework: cycle.testFramework,
          language: cycle.language,
        },
        nextStep: 'Write your first failing test using tdd_write_test',
      },
      null,
      2,
    );
  }

  async handleWriteTest(args: any): Promise<string> {
    const { testFile, testName, testCode, expectedToFail = true } = args;

    const cycle = this.stateManager.getCurrentCycle();
    if (!cycle) {
      throw new Error('No active TDD cycle. Run tdd_init_cycle first.');
    }

    await writeFile(testFile, testCode);

    const test = this.stateManager.addTest({
      name: testName,
      file: testFile,
      code: testCode,
      status: 'pending',
      expectedToFail,
    });

    return JSON.stringify(
      {
        success: true,
        message: 'Test written successfully',
        test: {
          id: test.id,
          name: test.name,
          file: test.file,
        },
        nextStep: 'Run tests with tdd_run_tests to verify they fail (RED phase)',
      },
      null,
      2,
    );
  }

  async handleRunTests(args: any): Promise<string> {
    const { testPattern, expectation } = args;

    const cycle = this.stateManager.getCurrentCycle();
    if (!cycle) {
      throw new Error('No active TDD cycle. Run tdd_init_cycle first.');
    }

    const result = await this.testRunner.runTests(cycle.testFramework, testPattern, expectation);

    cycle.tests.forEach(test => {
      this.stateManager.updateTestStatus(test.id, result.success ? 'passing' : 'failing');
    });

    let nextStep = '';
    let expectationsMetMessage = '';

    // Check if expectations were met and provide clear feedback
    if (expectation) {
      if (!result.expectationsMet) {
        expectationsMetMessage =
          expectation === 'pass'
            ? `⚠️  EXPECTATION NOT MET: Tests were expected to pass but ${result.failed} test(s) failed.`
            : `⚠️  EXPECTATION NOT MET: Tests were expected to fail but all tests passed.`;
      } else {
        expectationsMetMessage =
          expectation === 'pass'
            ? '✓ Tests passed as expected.'
            : '✓ Tests failed as expected (RED phase).';
      }
    }

    if (cycle.phase === 'red' && !result.success) {
      nextStep = 'Tests are failing as expected. Proceed to GREEN phase with tdd_implement';
    } else if (cycle.phase === 'green' && result.success) {
      nextStep = 'Tests are passing! Consider refactoring with tdd_refactor or complete the cycle';
    } else if (cycle.phase === 'refactor' && result.success) {
      nextStep = 'Tests still passing after refactor. Complete cycle with tdd_complete_cycle';
    } else {
      nextStep = 'Review test results and adjust implementation';
    }

    return JSON.stringify(
      {
        success: result.expectationsMet,
        result: {
          passed: result.passed,
          failed: result.failed,
          total: result.total,
          duration: result.duration,
          testSuccess: result.success,
          expectationsMet: result.expectationsMet,
        },
        expectation: expectation || 'none',
        expectationsMetMessage,
        output: formatTestOutput(result),
        nextStep,
      },
      null,
      2,
    );
  }

  async handleImplement(args: any): Promise<string> {
    const { file, code } = args;

    const cycle = this.stateManager.getCurrentCycle();
    if (!cycle) {
      throw new Error('No active TDD cycle. Run tdd_init_cycle first.');
    }

    if (cycle.phase !== 'red') {
      return JSON.stringify(
        {
          success: false,
          message: `Cannot implement in ${cycle.phase} phase. Should be in RED phase.`,
        },
        null,
        2,
      );
    }

    await writeFile(file, code);
    this.stateManager.setImplementation(code);
    this.stateManager.advancePhase('green');

    return JSON.stringify(
      {
        success: true,
        message: 'Implementation written',
        phase: 'green',
        nextStep: 'Run tests with tdd_run_tests to verify they pass (GREEN phase)',
      },
      null,
      2,
    );
  }

  async handleRefactor(args: any): Promise<string> {
    const { file, code, rationale } = args;

    const cycle = this.stateManager.getCurrentCycle();
    if (!cycle) {
      throw new Error('No active TDD cycle. Run tdd_init_cycle first.');
    }

    if (cycle.phase !== 'green') {
      return JSON.stringify(
        {
          success: false,
          message: `Cannot refactor in ${cycle.phase} phase. Should be in GREEN phase.`,
        },
        null,
        2,
      );
    }

    await writeFile(file, code);
    this.stateManager.advancePhase('refactor');

    return JSON.stringify(
      {
        success: true,
        message: 'Code refactored',
        rationale,
        phase: 'refactor',
        nextStep: 'Run tests with tdd_run_tests to ensure they still pass',
      },
      null,
      2,
    );
  }

  async handleStatus(): Promise<string> {
    const cycle = this.stateManager.getCurrentCycle();

    if (!cycle) {
      return JSON.stringify(
        {
          success: true,
          message: 'No active TDD cycle',
          recommendation: 'Start a new cycle with tdd_init_cycle',
        },
        null,
        2,
      );
    }

    return JSON.stringify(
      {
        success: true,
        cycle: {
          id: cycle.id,
          feature: cycle.feature,
          phase: cycle.phase,
          tests: cycle.tests.length,
          passingTests: cycle.tests.filter(t => t.status === 'passing').length,
          failingTests: cycle.tests.filter(t => t.status === 'failing').length,
          checkpoints: cycle.checkpoints.length,
        },
        recommendation: this.getRecommendation(cycle),
      },
      null,
      2,
    );
  }

  async handleCompleteCycle(args: any): Promise<string> {
    const { notes = '' } = args;

    const cycle = this.stateManager.completeCycle();

    if (!cycle) {
      throw new Error('No active TDD cycle to complete');
    }

    const summary = generateCycleSummary(cycle);

    return JSON.stringify(
      {
        success: true,
        message: 'TDD cycle completed',
        summary,
        notes,
        cycleId: cycle.id,
      },
      null,
      2,
    );
  }

  async handleCheckpoint(args: any): Promise<string> {
    const { description } = args;

    const checkpoint = this.stateManager.createCheckpoint(description);

    return JSON.stringify(
      {
        success: true,
        message: 'Checkpoint created',
        checkpoint: {
          id: checkpoint.id,
          description: checkpoint.description,
          phase: checkpoint.phase,
          timestamp: checkpoint.timestamp,
        },
      },
      null,
      2,
    );
  }

  async handleRollback(args: any): Promise<string> {
    const { checkpointId } = args;

    const success = this.stateManager.rollbackToCheckpoint(checkpointId);

    if (!success) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    return JSON.stringify(
      {
        success: true,
        message: `Rolled back to checkpoint ${checkpointId}`,
      },
      null,
      2,
    );
  }

  async handleCoverage(): Promise<string> {
    const cycle = this.stateManager.getCurrentCycle();
    if (!cycle) {
      throw new Error('No active TDD cycle');
    }

    return JSON.stringify(
      {
        success: true,
        message: 'Coverage analysis not yet implemented',
        note: 'Use your test framework coverage tools (e.g., vitest --coverage)',
      },
      null,
      2,
    );
  }

  private getRecommendation(cycle: any): string {
    const failingTests = cycle.tests.filter((t: any) => t.status === 'failing').length;
    const passingTests = cycle.tests.filter((t: any) => t.status === 'passing').length;

    if (cycle.phase === 'red' && failingTests > 0) {
      return 'Write implementation to make tests pass (tdd_implement)';
    } else if (cycle.phase === 'green' && passingTests === cycle.tests.length) {
      return 'Consider refactoring (tdd_refactor) or complete cycle (tdd_complete_cycle)';
    } else if (cycle.phase === 'refactor') {
      return 'Complete cycle (tdd_complete_cycle) or add more tests';
    }

    return 'Run tests to determine next step (tdd_run_tests)';
  }
}

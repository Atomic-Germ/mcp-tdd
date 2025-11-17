// Test execution utilities - extracted from complex handleRunTests function
import { TDDCycle, TDDPhase } from './tddTypes.js';

export interface TestExpectationResult {
  expectationMet: boolean;
  actualOutcome: 'fail' | 'pass';
  phaseUpdate: TDDPhase;
  statusIcon: string;
}

export interface TestRunResult {
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  duration: number;
  output?: string;
  failures?: Array<{ testName: string; error: string }>;
  coverage?: {
    lines: { percentage: number };
    branches: { percentage: number };
    functions: { percentage: number };
  };
}

/**
 * Validates test expectation against actual outcome
 */
export function validateTestExpectation(
  expectation: 'fail' | 'pass',
  result: TestRunResult,
  cycle: TDDCycle
): TestExpectationResult {
  const actualOutcome = result.testsFailed > 0 ? 'fail' : 'pass';
  const expectationMet = expectation === actualOutcome;
  
  let phaseUpdate: TDDPhase = cycle.phase;
  if (expectationMet) {
    if (expectation === 'fail' && cycle.phase === 'RED') {
      phaseUpdate = 'RED'; // Stay in RED, ready to implement
    } else if (expectation === 'pass' && result.testsFailed === 0) {
      phaseUpdate = 'GREEN'; // All tests pass!
    }
  }
  
  const statusIcon = expectationMet ? '✅' : '⚠️';
  
  return {
    expectationMet,
    actualOutcome,
    phaseUpdate,
    statusIcon
  };
}

/**
 * Creates basic test result message
 */
export function createBasicTestMessage(
  result: TestRunResult,
  expectationResult: TestExpectationResult,
  testPattern?: string
): string {
  const { statusIcon, actualOutcome, expectationMet, phaseUpdate } = expectationResult;
  
  let message = `${statusIcon} Tests ${actualOutcome === 'fail' ? 'failed' : 'passed'} ${expectationMet ? '(as expected)' : '(unexpected!)'}\n\n`;
  
  if (testPattern) {
    message += `**Test Pattern**: ${testPattern}\n`;
  }
  message += `**Tests Run**: ${result.testsRun}\n`;
  message += `**Passed**: ${result.testsPassed}\n`;
  message += `**Failed**: ${result.testsFailed}\n`;
  message += `**Skipped**: ${result.testsSkipped}\n`;
  message += `**Duration**: ${result.duration}ms\n`;
  message += `**Phase**: ${phaseUpdate}\n\n`;
  
  return message;
}

/**
 * Creates warning message for unmet expectations
 */
export function createExpectationWarning(
  expectation: 'fail' | 'pass',
  actualOutcome: 'fail' | 'pass'
): string {
  let message = `⚠️ **Warning**: Expected tests to ${expectation} but they ${actualOutcome}ed!\n\n`;
  
  if (expectation === 'fail' && actualOutcome === 'pass') {
    message += `**TDD Violation**: Tests should fail in RED phase before implementation!\n\n`;
    message += `**Possible causes**:\n`;
    message += `1. Test is not actually testing the new feature (test is too simple)\n`;
    message += `2. Implementation already exists for what you're testing\n`;
    message += `3. Test has a logic error and always passes\n`;
    message += `4. Wrong test file or pattern being executed\n\n`;
    message += `**Recommended actions**:\n`;
    message += `- Review the test code to ensure it properly exercises the new feature\n`;
    message += `- Verify the test is checking for behavior that doesn't exist yet\n`;
    message += `- Check that you're testing the right file/function\n`;
    message += `- Consider removing or commenting out existing implementation\n\n`;
  } else if (expectation === 'pass' && actualOutcome === 'fail') {
    message += `**Implementation Issue**: Tests are still failing after implementation!\n\n`;
    message += `**Recommended actions**:\n`;
    message += `- Review the implementation to address failing tests\n`;
    message += `- Check the failures below for specific errors\n`;
    message += `- Ensure implementation matches test expectations\n\n`;
  }
  
  return message;
}

/**
 * Creates failure details section
 */
export function createFailureDetails(result: TestRunResult): string {
  let message = '';
  
  if (result.failures && result.failures.length > 0) {
    message += `**Failures**:\n`;
    result.failures.forEach(f => {
      message += `- ${f.testName}: ${f.error}\n`;
    });
    message += '\n';
  }
  
  return message;
}

/**
 * Creates test output section for debugging
 */
export function createTestOutput(result: TestRunResult, expectationMet: boolean): string {
  let message = '';
  
  // Show test output for debugging if expectation not met
  if (!expectationMet && result.output && result.testsRun > 0) {
    const outputLines = result.output.split('\n').slice(-20).join('\n');
    message += `**Test Output (last 20 lines)**:\n\`\`\`\n${outputLines}\n\`\`\`\n\n`;
  }
  
  return message;
}

/**
 * Creates coverage information section
 */
export function createCoverageInfo(result: TestRunResult): string {
  let message = '';
  
  if (result.coverage) {
    message += `**Coverage**:\n`;
    message += `- Lines: ${result.coverage.lines.percentage.toFixed(1)}%\n`;
    message += `- Branches: ${result.coverage.branches.percentage.toFixed(1)}%\n`;
    message += `- Functions: ${result.coverage.functions.percentage.toFixed(1)}%\n\n`;
  }
  
  return message;
}
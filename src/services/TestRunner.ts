import { exec } from 'child_process';
import { promisify } from 'util';
import { TestResult, FailureDetail } from '../types/index.js';

const execAsync = promisify(exec);

export class TestRunner {
  async runTests(
    testFramework: string,
    testPattern?: string,
    expectation?: 'pass' | 'fail',
  ): Promise<TestResult & { expectationsMet: boolean }> {
    try {
      const command = this.buildTestCommand(testFramework, testPattern);
      const startTime = Date.now();

      try {
        const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });
        const duration = Date.now() - startTime;
        const output = stdout + stderr;

        const result = this.parseTestOutput(output, testFramework);
        result.duration = duration;

        if (expectation === 'fail' && result.success) {
          return {
            ...result,
            expectationsMet: false,
            output: output + '\n\nWarning: Tests were expected to fail but passed.',
          };
        }

        return {
          ...result,
          expectationsMet: expectation ? result.success === (expectation === 'pass') : true,
        };
      } catch (error: any) {
        const duration = Date.now() - startTime;
        const output = error.stdout + error.stderr;
        const result = this.parseTestOutput(output, testFramework);
        result.duration = duration;

        if (expectation === 'fail') {
          return {
            ...result,
            expectationsMet: true,
            output: output + '\n\nTests failed as expected (RED phase).',
          };
        }

        return {
          ...result,
          expectationsMet: false,
        };
      }
    } catch (error) {
      return {
        success: false,
        passed: 0,
        failed: 0,
        total: 0,
        output: error instanceof Error ? error.message : String(error),
        expectationsMet: false,
      };
    }
  }

  private buildTestCommand(framework: string, pattern?: string): string {
    const commands: Record<string, string> = {
      vitest: pattern ? `npx vitest run ${pattern}` : 'npx vitest run',
      jest: pattern ? `npx jest ${pattern}` : 'npx jest',
      mocha: pattern ? `npx mocha ${pattern}` : 'npx mocha',
    };

    return commands[framework] || commands.vitest;
  }

  private parseTestOutput(output: string, framework: string): TestResult {
    const result: TestResult = {
      success: false,
      passed: 0,
      failed: 0,
      total: 0,
      output,
      failures: [],
    };

    if (framework === 'vitest') {
      const passMatch = output.match(/(\d+) passed/);
      const failMatch = output.match(/(\d+) failed/);

      result.passed = passMatch ? parseInt(passMatch[1]) : 0;
      result.failed = failMatch ? parseInt(failMatch[1]) : 0;
      result.total = result.passed + result.failed;
      result.success = result.failed === 0 && result.total > 0;

      result.failures = this.extractVitestFailures(output);
    } else if (framework === 'jest') {
      const passMatch = output.match(/(\d+) passed/);
      const failMatch = output.match(/(\d+) failed/);

      result.passed = passMatch ? parseInt(passMatch[1]) : 0;
      result.failed = failMatch ? parseInt(failMatch[1]) : 0;
      result.total = result.passed + result.failed;
      result.success = result.failed === 0 && result.total > 0;

      result.failures = this.extractJestFailures(output);
    }

    return result;
  }

  private extractVitestFailures(output: string): FailureDetail[] {
    const failures: FailureDetail[] = [];

    // Match test name followed by failure reason
    // Vitest format: "● test name" followed by error details
    const failureBlocks = output.split('●').slice(1);

    for (const block of failureBlocks) {
      const lines = block.split('\n');
      if (lines.length === 0) continue;

      const testName = lines[0].trim();
      // Find the first error line after the test name
      let errorMessage = '';
      let verboseOutput = '';
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('at ') && line.length > 0) {
          if (!errorMessage) {
            errorMessage = line;
          }
          verboseOutput += line + '\n';
          // Capture up to 10 lines of context for single failures
          if (verboseOutput.split('\n').length >= 10) break;
        }
      }

      if (testName) {
        const failure: FailureDetail = {
          testName: testName.split('\n')[0],
          error: errorMessage || 'Test failed',
        };

        // Add verbose output for single failures
        if (verboseOutput.trim()) {
          failure.verboseOutput = verboseOutput.trim();
          failure.suggestion = this.generateSuggestion(errorMessage, failure.testName);
        }

        failures.push(failure);
      }
    }

    return failures.slice(0, 10); // Limit to 10 failures for brevity
  }

  private extractJestFailures(output: string): FailureDetail[] {
    const failures: FailureDetail[] = [];

    // Match Jest format: "● test name" followed by error details
    const failureBlocks = output.split('●').slice(1);

    for (const block of failureBlocks) {
      const lines = block.split('\n');
      if (lines.length === 0) continue;

      const testName = lines[0].trim();
      // Find the first error line after the test name
      let errorMessage = '';
      let verboseOutput = '';
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('at ') && line.length > 0) {
          if (!errorMessage) {
            errorMessage = line;
          }
          verboseOutput += line + '\n';
          // Capture up to 10 lines of context for single failures
          if (verboseOutput.split('\n').length >= 10) break;
        }
      }

      if (testName) {
        const failure: FailureDetail = {
          testName: testName.split('\n')[0],
          error: errorMessage || 'Test failed',
        };

        // Add verbose output for single failures
        if (verboseOutput.trim()) {
          failure.verboseOutput = verboseOutput.trim();
          failure.suggestion = this.generateSuggestion(errorMessage, failure.testName);
        }

        failures.push(failure);
      }
    }

    return failures.slice(0, 10); // Limit to 10 failures for brevity
  }

  private generateSuggestion(error: string, testName: string): string {
    // Analyze error message and generate helpful suggestions
    const lowerError = error.toLowerCase();

    if (lowerError.includes('is not a function')) {
      return 'Ensure the function is exported and has the correct name.';
    }
    if (
      lowerError.includes('cannot read property') ||
      lowerError.includes('cannot read properties')
    ) {
      return 'Check that object properties exist before accessing them.';
    }
    if (lowerError.includes('expected') && lowerError.includes('but received')) {
      return 'Verify the logic returns the expected value.';
    }
    if (lowerError.includes('undefined')) {
      return 'Check that variables are properly initialized and returned.';
    }
    if (lowerError.includes('nan')) {
      return 'Verify numeric operations and type conversions.';
    }
    if (lowerError.includes('typeerror')) {
      return 'Check function parameters and their types.';
    }
    if (lowerError.includes('syntaxerror')) {
      return 'Fix syntax errors in the implementation.';
    }

    // Extract what the test expects from test name
    if (testName.includes('should') || testName.includes('must')) {
      return `Implement the functionality that "${testName.toLowerCase()}".`;
    }

    return 'Review the implementation to ensure it meets the test requirements.';
  }
}

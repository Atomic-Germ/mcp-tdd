import { exec } from 'child_process';
import { promisify } from 'util';
import { TestResult } from '../types/index.js';

const execAsync = promisify(exec);

export class TestRunner {
  async runTests(
    testFramework: string,
    testPattern?: string,
    expectation?: 'pass' | 'fail',
  ): Promise<TestResult> {
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
            success: false,
            passed: result.passed,
            failed: result.failed,
            total: result.total,
            output: output + '\n\nWarning: Tests were expected to fail but passed.',
            duration,
          };
        }

        return result;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        const output = error.stdout + error.stderr;
        const result = this.parseTestOutput(output, testFramework);
        result.duration = duration;

        if (expectation === 'fail') {
          return {
            success: true,
            passed: result.passed,
            failed: result.failed,
            total: result.total,
            output: output + '\n\nTests failed as expected (RED phase).',
            duration,
          };
        }

        return result;
      }
    } catch (error) {
      return {
        success: false,
        passed: 0,
        failed: 0,
        total: 0,
        output: error instanceof Error ? error.message : String(error),
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
    };

    if (framework === 'vitest') {
      const passMatch = output.match(/(\d+) passed/);
      const failMatch = output.match(/(\d+) failed/);

      result.passed = passMatch ? parseInt(passMatch[1]) : 0;
      result.failed = failMatch ? parseInt(failMatch[1]) : 0;
      result.total = result.passed + result.failed;
      result.success = result.failed === 0 && result.total > 0;
    } else if (framework === 'jest') {
      const passMatch = output.match(/(\d+) passed/);
      const failMatch = output.match(/(\d+) failed/);

      result.passed = passMatch ? parseInt(passMatch[1]) : 0;
      result.failed = failMatch ? parseInt(failMatch[1]) : 0;
      result.total = result.passed + result.failed;
      result.success = result.failed === 0 && result.total > 0;
    }

    return result;
  }
}

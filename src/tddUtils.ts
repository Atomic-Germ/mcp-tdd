// TDD Utilities - test running, file management, and validation
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { TestRunResult, TDDPhase, TestFailure, CoverageReport } from './tddTypes.js';

const execAsync = promisify(exec);

export async function runTests(
  testPattern?: string,
  coverage: boolean = false
): Promise<TestRunResult> {
  const framework = process.env.TEST_FRAMEWORK || 'jest';
  const startTime = Date.now();
  
  try {
    let command = '';
    
    switch (framework.toLowerCase()) {
      case 'jest':
        command = `npx jest ${testPattern || ''} ${coverage ? '--coverage' : ''} --json --outputFile=/tmp/jest-output.json`;
        break;
      case 'vitest':
        command = `npx vitest run ${testPattern || ''} ${coverage ? '--coverage' : ''} --reporter=json --outputFile=/tmp/vitest-output.json`;
        break;
      case 'mocha':
        command = `npx mocha ${testPattern || ''} ${coverage ? '--require nyc' : ''} --reporter json > /tmp/mocha-output.json`;
        break;
      default:
        command = `npx ${framework} ${testPattern || ''}`;
    }
    
    const { stdout, stderr } = await execAsync(command, { 
      cwd: process.cwd(),
      timeout: 300000 // 5 minutes
    });
    
    const duration = Date.now() - startTime;
    const output = stdout + stderr;
    
    // Parse test results based on framework
    const result = await parseTestOutput(framework, output, duration);
    
    if (coverage) {
      result.coverage = await parseCoverageReport(framework);
    }
    
    return result;
    
  } catch (error: any) {
    // Tests failed, but we still want to parse the results
    const duration = Date.now() - startTime;
    const output = error.stdout || error.stderr || error.message;
    
    try {
      const result = await parseTestOutput(framework, output, duration);
      return result;
    } catch (parseError) {
      return {
        success: false,
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
        testsSkipped: 0,
        duration,
        output: output || 'Test execution failed',
        failures: [{
          testName: 'unknown',
          testFile: 'unknown',
          error: error.message
        }]
      };
    }
  }
}

async function parseTestOutput(
  framework: string,
  output: string,
  duration: number
): Promise<TestRunResult> {
  const result: TestRunResult = {
    success: false,
    testsRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    testsSkipped: 0,
    duration,
    output,
    failures: []
  };
  
  try {
    switch (framework.toLowerCase()) {
      case 'jest': {
        const jsonPath = '/tmp/jest-output.json';
        const data = await fs.readFile(jsonPath, 'utf-8').catch(() => '{}');
        const parsed = JSON.parse(data);
        
        result.testsRun = parsed.numTotalTests || 0;
        result.testsPassed = parsed.numPassedTests || 0;
        result.testsFailed = parsed.numFailedTests || 0;
        result.testsSkipped = parsed.numPendingTests || 0;
        result.success = parsed.success || false;
        
        if (parsed.testResults) {
          result.failures = parsed.testResults
            .flatMap((suite: any) => 
              (suite.assertionResults || [])
                .filter((test: any) => test.status === 'failed')
                .map((test: any) => ({
                  testName: test.title || test.fullName,
                  testFile: suite.name,
                  error: test.failureMessages?.join('\n') || 'Test failed'
                }))
            );
        }
        break;
      }
      
      case 'vitest': {
        const jsonPath = '/tmp/vitest-output.json';
        const data = await fs.readFile(jsonPath, 'utf-8').catch(() => '{}');
        const parsed = JSON.parse(data);
        
        result.testsRun = parsed.numTotalTests || 0;
        result.testsPassed = parsed.numPassedTests || 0;
        result.testsFailed = parsed.numFailedTests || 0;
        result.success = parsed.success || false;
        break;
      }
      
      default:
        // Parse from text output
        result.success = !output.toLowerCase().includes('failed');
        
        const passedMatch = output.match(/(\d+)\s+passing/i);
        if (passedMatch) result.testsPassed = parseInt(passedMatch[1]);
        
        const failedMatch = output.match(/(\d+)\s+failing/i);
        if (failedMatch) result.testsFailed = parseInt(failedMatch[1]);
        
        result.testsRun = result.testsPassed + result.testsFailed;
    }
  } catch (error) {
    console.error('Failed to parse test output:', error);
  }
  
  return result;
}

async function parseCoverageReport(framework: string): Promise<CoverageReport | undefined> {
  try {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    const data = await fs.readFile(coveragePath, 'utf-8').catch(() => null);
    
    if (!data) return undefined;
    
    const parsed = JSON.parse(data);
    const total = parsed.total || {};
    
    return {
      lines: {
        total: total.lines?.total || 0,
        covered: total.lines?.covered || 0,
        percentage: total.lines?.pct || 0
      },
      branches: {
        total: total.branches?.total || 0,
        covered: total.branches?.covered || 0,
        percentage: total.branches?.pct || 0
      },
      functions: {
        total: total.functions?.total || 0,
        covered: total.functions?.covered || 0,
        percentage: total.functions?.pct || 0
      },
      statements: {
        total: total.statements?.total || 0,
        covered: total.statements?.covered || 0,
        percentage: total.statements?.pct || 0
      }
    };
  } catch (error) {
    console.error('Failed to parse coverage report:', error);
    return undefined;
  }
}

export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error}`);
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function backupFile(filePath: string): Promise<string> {
  const backupPath = `${filePath}.backup-${Date.now()}`;
  try {
    const content = await readFile(filePath);
    await writeFile(backupPath, content);
    return backupPath;
  } catch (error) {
    throw new Error(`Failed to backup file ${filePath}: ${error}`);
  }
}

export function validatePhaseTransition(
  currentPhase: TDDPhase,
  targetPhase: TDDPhase,
  testsFailing: number,
  testsPassing: number
): { valid: boolean; error?: string } {
  const strictMode = process.env.TDD_STRICT_MODE !== 'false';
  
  if (!strictMode) {
    return { valid: true };
  }
  
  switch (targetPhase) {
    case 'RED':
      if (currentPhase === 'COMPLETE') {
        return { valid: false, error: 'Cannot go to RED from COMPLETE. Start a new cycle.' };
      }
      return { valid: true };
      
    case 'GREEN':
      if (testsFailing === 0) {
        return { 
          valid: false, 
          error: 'Cannot go to GREEN phase without failing tests. Write tests first (RED phase).' 
        };
      }
      return { valid: true };
      
    case 'REFACTOR':
      if (testsFailing > 0) {
        return { 
          valid: false, 
          error: 'Cannot refactor with failing tests. Fix tests first (GREEN phase).' 
        };
      }
      if (testsPassing === 0) {
        return { 
          valid: false, 
          error: 'Cannot refactor without passing tests. Write and pass tests first.' 
        };
      }
      return { valid: true };
      
    case 'COMPLETE':
      if (testsFailing > 0) {
        return { 
          valid: false, 
          error: 'Cannot complete cycle with failing tests. All tests must pass.' 
        };
      }
      if (testsPassing === 0) {
        return { 
          valid: false, 
          error: 'Cannot complete cycle without any passing tests.' 
        };
      }
      return { valid: true };
      
    default:
      return { valid: true };
  }
}

export function determineNextAction(
  phase: TDDPhase,
  testsFailing: number,
  testsPassing: number
): string {
  switch (phase) {
    case 'READY':
      return 'Write your first failing test using tdd_write_test';
      
    case 'RED':
      if (testsFailing === 0) {
        return 'Write more tests that will fail, or verify existing tests fail with tdd_run_tests';
      }
      return 'Implement code to make failing tests pass using tdd_implement';
      
    case 'GREEN':
      if (testsFailing > 0) {
        return 'Continue implementing code to make all tests pass';
      }
      return 'Consider refactoring with tdd_refactor, or add more tests (RED), or complete cycle';
      
    case 'REFACTOR':
      return 'Run tests to verify refactoring did not break anything, then add more tests or complete';
      
    case 'COMPLETE':
      return 'Cycle complete. Start a new cycle with tdd_init_cycle';
      
    default:
      return 'Unknown state';
  }
}

export async function createCheckpointSnapshot(files: string[]): Promise<Record<string, string>> {
  const snapshot: Record<string, string> = {};
  
  for (const file of files) {
    if (await fileExists(file)) {
      try {
        snapshot[file] = await readFile(file);
      } catch (error) {
        console.warn(`Failed to snapshot file ${file}:`, error);
      }
    }
  }
  
  return snapshot;
}

export async function restoreCheckpointSnapshot(snapshot: Record<string, string>): Promise<void> {
  for (const [file, content] of Object.entries(snapshot)) {
    try {
      await writeFile(file, content);
    } catch (error) {
      console.error(`Failed to restore file ${file}:`, error);
      throw error;
    }
  }
}

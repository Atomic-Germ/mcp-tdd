import fs from 'fs/promises';
import path from 'path';

export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function formatTestOutput(result: any): string {
  const lines = [
    `Test Results:`,
    `  Total: ${result.total}`,
    `  Passed: ${result.passed}`,
    `  Failed: ${result.failed}`,
    `  Success: ${result.success ? '✓' : '✗'}`,
  ];

  if (result.duration) {
    lines.push(`  Duration: ${result.duration}ms`);
  }

  return lines.join('\n');
}

export function generateCycleSummary(cycle: any): string {
  const lines = [
    `TDD Cycle Summary`,
    `================`,
    `Feature: ${cycle.feature}`,
    `Description: ${cycle.description}`,
    `Phase: ${cycle.phase}`,
    `Tests: ${cycle.tests.length}`,
    `  - Passing: ${cycle.tests.filter((t: any) => t.status === 'passing').length}`,
    `  - Failing: ${cycle.tests.filter((t: any) => t.status === 'failing').length}`,
    `  - Pending: ${cycle.tests.filter((t: any) => t.status === 'pending').length}`,
    `Created: ${cycle.createdAt}`,
  ];

  return lines.join('\n');
}

// TDD State Manager - maintains the current TDD cycle state
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  TDDState,
  TDDCycle,
  TDDTest,
  Implementation,
  Refactoring,
  Checkpoint,
  TDDConfig,
} from './tddTypes.js';

const STATE_DIR = process.env.TDD_STATE_DIR || path.join(os.tmpdir(), 'mcp-tdd-state');
const STATE_FILE = path.join(STATE_DIR, 'tdd-state.json');

// Track cleanup handlers
const cleanupHandlers: Array<() => Promise<void>> = [];

// Register cleanup for graceful shutdown
function registerCleanupHandler(handler: () => Promise<void>): void {
  cleanupHandlers.push(handler);
}

// Cleanup function for graceful shutdown
export async function cleanup(): Promise<void> {
  console.error('Cleaning up TDD state...');

  try {
    // Save current state before cleanup
    await saveState();

    // Run all registered cleanup handlers
    await Promise.all(
      cleanupHandlers.map(handler =>
        handler().catch(error => console.error('Cleanup handler failed:', error)),
      ),
    );

    // Clean up temp directories if in test environment
    if (process.env.NODE_ENV === 'test' || process.env.TDD_STATE_DIR?.includes('test')) {
      try {
        const currentStateDir = process.env.TDD_STATE_DIR || STATE_DIR;
        await fs.rm(currentStateDir, { recursive: true, force: true });
        console.error('Cleaned up temp state directory:', currentStateDir);
      } catch (error) {
        console.error('Failed to clean up temp directory:', error);
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Register process exit handlers
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, cleaning up...');
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, cleaning up...');
    await cleanup();
    process.exit(0);
  });

  process.on('beforeExit', async () => {
    await cleanup();
  });
}

const defaultConfig: TDDConfig = {
  testFramework: process.env.TEST_FRAMEWORK || 'jest',
  language: 'typescript',
  coverageThreshold: parseInt(process.env.MIN_COVERAGE || '80'),
  strictMode: process.env.TDD_STRICT_MODE !== 'false',
  autoRunTests: true,
  checkpointOnPhase: ['GREEN'],
  consultOnComplexity: true,
  testPatterns: {
    unit: '**/*.test.ts',
    integration: '**/*.integration.ts',
    e2e: '**/*.e2e.ts',
  },
};

let state: TDDState = {
  cycles: {},
  tests: {},
  implementations: {},
  refactorings: {},
  checkpoints: {},
  config: defaultConfig,
};

export async function initializeState(): Promise<void> {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    const data = await fs.readFile(STATE_FILE, 'utf-8').catch(() => null);
    if (data) {
      const parsed = JSON.parse(data);
      state = {
        ...parsed,
        config: { ...defaultConfig, ...parsed.config },
      };
    }
  } catch (error) {
    console.error('Failed to load TDD state, using defaults:', error);
  }
}

export async function saveState(): Promise<void> {
  try {
    // Use current environment variable if set, otherwise use default
    const currentStateDir = process.env.TDD_STATE_DIR || STATE_DIR;
    const currentStateFile = path.join(currentStateDir, 'tdd-state.json');

    await fs.mkdir(currentStateDir, { recursive: true });
    await fs.writeFile(currentStateFile, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save TDD state:', error);
  }
}

export function getState(): TDDState {
  return state;
}

export function getActiveCycle(): TDDCycle | undefined {
  return state.activeCycle;
}

export function setActiveCycle(cycle: TDDCycle): void {
  state.activeCycle = cycle;
  state.cycles[cycle.id] = cycle;
}

export function updateCycle(cycleId: string, updates: Partial<TDDCycle>): TDDCycle | undefined {
  const cycle = state.cycles[cycleId];
  if (!cycle) return undefined;

  const updated = {
    ...cycle,
    ...updates,
    updatedAt: new Date(),
  };

  state.cycles[cycleId] = updated;
  if (state.activeCycle?.id === cycleId) {
    state.activeCycle = updated;
  }

  return updated;
}

export function addTest(test: TDDTest): void {
  state.tests[test.id] = test;
}

export function updateTest(testId: string, updates: Partial<TDDTest>): TDDTest | undefined {
  const test = state.tests[testId];
  if (!test) return undefined;

  const updated = { ...test, ...updates };
  state.tests[testId] = updated;
  return updated;
}

export function getTestsByCycle(cycleId: string): TDDTest[] {
  return Object.values(state.tests).filter(t => t.cycleId === cycleId);
}

export function addImplementation(impl: Implementation): void {
  state.implementations[impl.id] = impl;
}

export function getImplementationsByCycle(cycleId: string): Implementation[] {
  return Object.values(state.implementations).filter(i => i.cycleId === cycleId);
}

export function addRefactoring(refactoring: Refactoring): void {
  state.refactorings[refactoring.id] = refactoring;
}

export function getRefactoringsByCycle(cycleId: string): Refactoring[] {
  return Object.values(state.refactorings).filter(r => r.cycleId === cycleId);
}

export function addCheckpoint(checkpoint: Checkpoint): void {
  state.checkpoints[checkpoint.id] = checkpoint;
}

export function getCheckpoint(checkpointId: string): Checkpoint | undefined {
  return state.checkpoints[checkpointId];
}

export function getCheckpointsByCycle(cycleId: string): Checkpoint[] {
  return Object.values(state.checkpoints).filter(c => c.cycleId === cycleId);
}

export function clearActiveCycle(): void {
  state.activeCycle = undefined;
}

export function getConfig(): TDDConfig {
  return state.config;
}

export function updateConfig(updates: Partial<TDDConfig>): void {
  state.config = { ...state.config, ...updates };
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Track temporary files for cleanup
const tempFiles = new Set<string>();

export function registerTempFile(filePath: string): void {
  tempFiles.add(filePath);

  // Register cleanup handler for this file
  registerCleanupHandler(async () => {
    try {
      await fs.unlink(filePath);
      tempFiles.delete(filePath);
    } catch {
      // File might already be deleted, that's ok
    }
  });
}

export function unregisterTempFile(filePath: string): void {
  tempFiles.delete(filePath);
}

export function getTempFiles(): string[] {
  return Array.from(tempFiles);
}

// Health check function
export async function healthCheck(): Promise<{
  stateDir: string;
  stateFileExists: boolean;
  tempFilesCount: number;
  activeCycle: boolean;
}> {
  const currentStateDir = process.env.TDD_STATE_DIR || STATE_DIR;
  const currentStateFile = path.join(currentStateDir, 'tdd-state.json');

  let stateFileExists = false;
  try {
    await fs.access(currentStateFile);
    stateFileExists = true;
  } catch {
    // File doesn't exist
  }

  return {
    stateDir: currentStateDir,
    stateFileExists,
    tempFilesCount: tempFiles.size,
    activeCycle: !!state.activeCycle,
  };
}

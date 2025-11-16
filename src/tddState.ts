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
  TDDPhase
} from './tddTypes.js';

const STATE_DIR = process.env.TDD_STATE_DIR || path.join(os.tmpdir(), 'mcp-tdd-state');
const STATE_FILE = path.join(STATE_DIR, 'tdd-state.json');

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
    e2e: '**/*.e2e.ts'
  }
};

let state: TDDState = {
  cycles: {},
  tests: {},
  implementations: {},
  refactorings: {},
  checkpoints: {},
  config: defaultConfig
};

export async function initializeState(): Promise<void> {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    const data = await fs.readFile(STATE_FILE, 'utf-8').catch(() => null);
    if (data) {
      const parsed = JSON.parse(data);
      state = {
        ...parsed,
        config: { ...defaultConfig, ...parsed.config }
      };
    }
  } catch (error) {
    console.error('Failed to load TDD state, using defaults:', error);
  }
}

export async function saveState(): Promise<void> {
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
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
    updatedAt: new Date()
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

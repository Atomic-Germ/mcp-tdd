// TDD-specific types for the MCP TDD server

export type TDDPhase = 'READY' | 'RED' | 'GREEN' | 'REFACTOR' | 'COMPLETE';

export interface TDDCycle {
  id: string;
  feature: string;
  description: string;
  testFramework?: string;
  language?: string;
  files?: string[];
  phase: TDDPhase;
  createdAt: Date;
  updatedAt: Date;
  testsWritten: number;
  testsPassing: number;
  testsFailing: number;
  implementations: string[];
  refactorings: string[];
}

export interface TDDTest {
  id: string;
  cycleId: string;
  testFile: string;
  testName: string;
  testCode: string;
  category?: 'unit' | 'integration' | 'e2e';
  expectedToFail: boolean;
  status: 'pending' | 'failed' | 'passed';
  createdAt: Date;
  lastRun?: Date;
}

export interface TestRunResult {
  success: boolean;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  duration: number;
  coverage?: CoverageReport;
  failures?: TestFailure[];
  output: string;
}

export interface TestFailure {
  testName: string;
  testFile: string;
  error: string;
  stack?: string;
}

export interface CoverageReport {
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
  files?: FileCoverage[];
}

export interface FileCoverage {
  path: string;
  linesCovered: number;
  linesTotal: number;
  percentage: number;
}

export interface Implementation {
  id: string;
  cycleId: string;
  implementationFile: string;
  code: string;
  testsCovered: string[];
  minimal: boolean;
  createdAt: Date;
  verified: boolean;
}

export interface Refactoring {
  id: string;
  cycleId: string;
  file: string;
  changes: string;
  testsBefore: TestRunResult;
  testsAfter?: TestRunResult;
  createdAt: Date;
  success: boolean;
}

export interface Checkpoint {
  id: string;
  cycleId: string;
  checkpointName: string;
  reason?: string;
  phase: TDDPhase;
  filesSnapshot: Record<string, string>;
  testsSnapshot: TDDTest[];
  createdAt: Date;
}

export interface TDDStatus {
  cycleId: string;
  feature: string;
  phase: TDDPhase;
  testsWritten: number;
  testsPassing: number;
  testsFailing: number;
  nextAction: string;
  cycleDuration: number;
  filesModified: string[];
  canProceed: boolean;
  warnings?: string[];
}

export interface CycleCompletion {
  cycleId: string;
  summary: string;
  testsAdded: number;
  testsPassing: number;
  implementationsCount: number;
  refactoringsCount: number;
  duration: number;
  filesModified: string[];
  success: boolean;
}

export interface ConsultRequest {
  question: string;
  context: {
    cycleId?: string;
    phase?: TDDPhase;
    language?: string;
    testFramework?: string;
    recentTests?: string[];
    recentImplementations?: string[];
  };
  model?: string;
  expectation?: string;
}

export interface ConsultResponse {
  question: string;
  answer: string;
  model: string;
  timestamp: Date;
  confidence?: number;
}

export interface ApproachComparison {
  approaches: Approach[];
  criteria: string[];
  recommendation?: string;
  analysis: string;
}

export interface Approach {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  complexity: 'low' | 'medium' | 'high';
  testability: 'low' | 'medium' | 'high';
  score?: number;
}

export interface TDDConfig {
  testFramework: string;
  language: string;
  coverageThreshold: number;
  strictMode: boolean;
  autoRunTests: boolean;
  checkpointOnPhase: TDDPhase[];
  consultOnComplexity: boolean;
  testPatterns: {
    unit?: string;
    integration?: string;
    e2e?: string;
  };
}

export interface TDDState {
  activeCycle?: TDDCycle;
  cycles: Record<string, TDDCycle>;
  tests: Record<string, TDDTest>;
  implementations: Record<string, Implementation>;
  refactorings: Record<string, Refactoring>;
  checkpoints: Record<string, Checkpoint>;
  config: TDDConfig;
}

export interface TDDConfig {
  testFramework?: 'jest' | 'vitest' | 'mocha';
  language?: 'typescript' | 'javascript';
  testDirectory?: string;
  sourceDirectory?: string;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
}

export interface TDDCycle {
  id: string;
  feature: string;
  description: string;
  phase: 'red' | 'green' | 'refactor' | 'complete';
  testFramework: string;
  language: string;
  createdAt: Date;
  tests: TestCase[];
  implementation?: string;
  checkpoints: Checkpoint[];
}

export interface TestCase {
  id: string;
  name: string;
  file: string;
  code: string;
  status: 'pending' | 'failing' | 'passing';
  expectedToFail: boolean;
}

export interface Checkpoint {
  id: string;
  timestamp: Date;
  phase: string;
  description: string;
  state: any;
}

export interface FailureDetail {
  testName: string;
  error: string;
}

export interface TestResult {
  success: boolean;
  passed: number;
  failed: number;
  total: number;
  output: string;
  duration?: number;
  failures?: FailureDetail[];
}

export interface CoverageReport {
  lines: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
}

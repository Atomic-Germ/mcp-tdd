import { TDDConfig, Tool, ServerInfo } from './types/index.js';

const DEFAULT_CONFIG: Required<TDDConfig> = {
  testFramework: 'vitest',
  language: 'typescript',
  testDirectory: './test',
  sourceDirectory: './src',
};

export class TDDServer {
  public readonly name = 'mcp-tdd';
  public readonly version = '2.0.0';
  private readonly protocolVersion = '2024-11-05';
  public readonly config: Required<TDDConfig>;

  constructor(config: TDDConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getServerInfo(): ServerInfo {
    return {
      name: this.name,
      version: this.version,
      protocolVersion: this.protocolVersion,
    };
  }

  listTools(): Tool[] {
    return [
      {
        name: 'tdd_init_cycle',
        description: 'Initialize a new TDD cycle for a feature or bug fix',
        inputSchema: {
          type: 'object',
          properties: {
            feature: { type: 'string', description: 'Feature name or identifier' },
            description: { type: 'string', description: 'Detailed description of the feature' },
            testFramework: {
              type: 'string',
              enum: ['jest', 'vitest', 'mocha'],
              description: 'Test framework to use',
              default: 'vitest',
            },
            language: {
              type: 'string',
              enum: ['typescript', 'javascript'],
              description: 'Programming language',
              default: 'typescript',
            },
          },
          required: ['feature', 'description'],
        },
      },
      {
        name: 'tdd_write_test',
        description: 'Write or update a test case (RED phase)',
        inputSchema: {
          type: 'object',
          properties: {
            testFile: { type: 'string', description: 'Path to the test file' },
            testName: { type: 'string', description: 'Name of the test case' },
            testCode: { type: 'string', description: 'Test code to write' },
            expectedToFail: {
              type: 'boolean',
              description: 'Whether test is expected to fail initially',
              default: true,
            },
          },
          required: ['testFile', 'testName', 'testCode'],
        },
      },
      {
        name: 'tdd_run_tests',
        description: 'Execute tests and report results',
        inputSchema: {
          type: 'object',
          properties: {
            testPattern: { type: 'string', description: 'Pattern to match test files' },
            expectation: {
              type: 'string',
              enum: ['pass', 'fail'],
              description: 'Expected test outcome',
            },
          },
          required: [],
        },
      },
      {
        name: 'tdd_implement',
        description: 'Implement code to make tests pass (GREEN phase)',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'Path to implementation file' },
            code: { type: 'string', description: 'Implementation code' },
          },
          required: ['file', 'code'],
        },
      },
      {
        name: 'tdd_refactor',
        description: 'Refactor code while maintaining tests (REFACTOR phase)',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'Path to file to refactor' },
            code: { type: 'string', description: 'Refactored code' },
            rationale: { type: 'string', description: 'Reason for refactoring' },
          },
          required: ['file', 'code'],
        },
      },
      {
        name: 'tdd_status',
        description: 'Get current TDD cycle status and recommended next action',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'tdd_complete_cycle',
        description: 'Mark TDD cycle as complete and generate summary',
        inputSchema: {
          type: 'object',
          properties: {
            notes: { type: 'string', description: 'Optional completion notes' },
          },
          required: [],
        },
      },
      {
        name: 'tdd_checkpoint',
        description: 'Save current state for potential rollback',
        inputSchema: {
          type: 'object',
          properties: {
            description: { type: 'string', description: 'Checkpoint description' },
          },
          required: ['description'],
        },
      },
      {
        name: 'tdd_rollback',
        description: 'Rollback to a previous checkpoint',
        inputSchema: {
          type: 'object',
          properties: {
            checkpointId: { type: 'string', description: 'ID of checkpoint to rollback to' },
          },
          required: ['checkpointId'],
        },
      },
      {
        name: 'tdd_coverage',
        description: 'Analyze test coverage metrics',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Path to analyze coverage for' },
          },
          required: [],
        },
      },
    ];
  }
}

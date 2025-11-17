# TDD MCP Server - API Reference

Complete API documentation for Test-Driven Development workflow tools.

## Table of Contents

- [Core TDD Tools](#core-tdd-tools)
  - [tdd_init_cycle](#tdd_init_cycle)
  - [tdd_write_test](#tdd_write_test)
  - [tdd_run_tests](#tdd_run_tests)
  - [tdd_implement](#tdd_implement)
  - [tdd_refactor](#tdd_refactor)
- [Workflow Management](#workflow-management)
  - [tdd_status](#tdd_status)
  - [tdd_complete_cycle](#tdd_complete_cycle)
  - [tdd_checkpoint](#tdd_checkpoint)
  - [tdd_rollback](#tdd_rollback)
- [Analysis Tools](#analysis-tools)
  - [tdd_coverage](#tdd_coverage)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Configuration](#configuration)

## Core TDD Tools

### tdd_init_cycle

Initialize a new TDD cycle for a feature or bug fix.

#### Parameters

| Parameter             | Type                          | Required | Description                                  |
| --------------------- | ----------------------------- | -------- | -------------------------------------------- |
| `feature`             | string                        | ✅       | Feature name or identifier                   |
| `description`         | string                        | ✅       | Detailed description of the feature          |
| `language`            | 'typescript' \| 'javascript'  | ❌       | Programming language (default: 'typescript') |
| `testFramework`       | 'jest' \| 'vitest' \| 'mocha' | ❌       | Test framework (default: 'vitest')           |
| `estimatedComplexity` | 'low' \| 'medium' \| 'high'   | ❌       | Complexity estimate for planning             |

#### Example Request

```typescript
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "user-authentication",
    description: "Implement JWT-based user authentication with refresh tokens",
    language: "typescript",
    testFramework: "vitest",
    estimatedComplexity: "medium"
  }
}
```

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_init_cycle",
  data: {
    cycleId: "cycle-20241117-001",
    feature: "user-authentication",
    phase: "RED",
    currentStep: "write-first-test",
    summary: "TDD cycle initialized for user authentication feature",
    recommendations: [
      "Start with a simple happy path test",
      "Focus on the public API first",
      "Consider edge cases for invalid tokens"
    ],
    suggestedTestFiles: [
      "./test/auth/authentication.test.ts",
      "./test/auth/tokenRefresh.test.ts"
    ],
    suggestedImplementationFiles: [
      "./src/auth/authService.ts",
      "./src/auth/tokenManager.ts"
    ]
  },
  metadata: {
    timestamp: "2025-11-17T10:30:00Z",
    framework: "vitest",
    language: "typescript",
    estimatedDuration: "2-3 hours"
  }
}
```

---

### tdd_write_test

Write or update a test case (RED phase).

#### Parameters

| Parameter        | Type                             | Required | Description                                        |
| ---------------- | -------------------------------- | -------- | -------------------------------------------------- |
| `testFile`       | string                           | ✅       | Path to the test file                              |
| `testName`       | string                           | ✅       | Name of the test case                              |
| `testCode`       | string                           | ✅       | Test code to write                                 |
| `expectedToFail` | boolean                          | ❌       | Whether test should fail initially (default: true) |
| `testType`       | 'unit' \| 'integration' \| 'e2e' | ❌       | Type of test                                       |
| `dependencies`   | string[]                         | ❌       | External dependencies needed                       |

#### Example Request

```typescript
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/auth/authentication.test.ts",
    testName: "should authenticate user with valid credentials",
    expectedToFail: true,
    testType: "unit",
    testCode: `
import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../../src/auth/authService';
import { TokenManager } from '../../src/auth/tokenManager';

describe('AuthService', () => {
  it('should authenticate user with valid credentials', async () => {
    const mockTokenManager = {
      generateAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
      generateRefreshToken: vi.fn().mockResolvedValue('mock-refresh-token')
    };

    const authService = new AuthService(mockTokenManager);

    const result = await authService.authenticate({
      username: 'testuser',
      password: 'validpassword'
    });

    expect(result).toEqual({
      success: true,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600
    });
  });
});
    `
  }
}
```

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_write_test",
  data: {
    testAdded: true,
    testFile: "./test/auth/authentication.test.ts",
    testName: "should authenticate user with valid credentials",
    phase: "RED",
    summary: "Test written and ready to fail",
    nextAction: "run-tests",
    codeAnalysis: {
      linesOfCode: 23,
      dependencies: ["vitest", "@types/node"],
      testComplexity: "medium",
      coverageTargets: ["AuthService.authenticate"]
    }
  },
  metadata: {
    timestamp: "2025-11-17T10:35:00Z",
    cycleId: "cycle-20241117-001",
    testFramework: "vitest"
  }
}
```

---

### tdd_run_tests

Execute tests and report results.

#### Parameters

| Parameter     | Type             | Required | Description                  |
| ------------- | ---------------- | -------- | ---------------------------- |
| `testPattern` | string           | ❌       | Pattern to match test files  |
| `expectation` | 'pass' \| 'fail' | ❌       | Expected test outcome        |
| `coverage`    | boolean          | ❌       | Collect coverage information |
| `watch`       | boolean          | ❌       | Run in watch mode            |
| `verbose`     | boolean          | ❌       | Verbose output               |

#### Example Request

```typescript
{
  tool: "tdd_run_tests",
  arguments: {
    testPattern: "./test/auth/**/*.test.ts",
    expectation: "fail",
    coverage: true,
    verbose: true
  }
}
```

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_run_tests",
  data: {
    phase: "RED",
    expectation: "fail",
    actualResult: "fail",
    expectationMet: true,
    summary: "Tests failed as expected - ready for implementation",
    results: {
      total: 1,
      passed: 0,
      failed: 1,
      skipped: 0,
      duration: 245
    },
    failures: [
      {
        testName: "should authenticate user with valid credentials",
        error: "Cannot resolve module '../../src/auth/authService'",
        file: "./test/auth/authentication.test.ts",
        line: 2,
        expected: "Module should exist with AuthService export",
        actual: "Module not found"
      }
    ],
    coverage: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    },
    nextAction: "implement",
    recommendations: [
      "Create AuthService class with authenticate method",
      "Implement basic authentication logic",
      "Ensure TokenManager dependency is available"
    ]
  },
  metadata: {
    timestamp: "2025-11-17T10:40:00Z",
    cycleId: "cycle-20241117-001",
    testFramework: "vitest",
    command: "npm test -- --coverage ./test/auth/"
  }
}
```

---

### tdd_implement

Implement code to make tests pass (GREEN phase).

#### Parameters

| Parameter     | Type    | Required | Description                                   |
| ------------- | ------- | -------- | --------------------------------------------- |
| `file`        | string  | ✅       | Path to implementation file                   |
| `code`        | string  | ✅       | Implementation code                           |
| `testDriven`  | boolean | ❌       | Ensure minimal implementation (default: true) |
| `description` | string  | ❌       | Description of implementation                 |

#### Example Request

```typescript
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/auth/authService.ts",
    description: "Minimal AuthService implementation to make test pass",
    testDriven: true,
    code: `
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenManager {
  generateAccessToken(userId: string): Promise<string>;
  generateRefreshToken(userId: string): Promise<string>;
}

export class AuthService {
  constructor(private tokenManager: TokenManager) {}

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    // Minimal implementation - just make the test pass
    const accessToken = await this.tokenManager.generateAccessToken('user-id');
    const refreshToken = await this.tokenManager.generateRefreshToken('user-id');

    return {
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }
}
    `
  }
}
```

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_implement",
  data: {
    implemented: true,
    file: "./src/auth/authService.ts",
    phase: "GREEN",
    summary: "Minimal implementation created to make tests pass",
    nextAction: "run-tests",
    codeAnalysis: {
      linesOfCode: 32,
      functions: 1,
      classes: 1,
      interfaces: 3,
      complexity: "low",
      testDrivenCompliance: true
    },
    recommendations: [
      "Run tests to verify implementation",
      "Consider edge cases after tests pass",
      "Plan refactoring for better design"
    ]
  },
  metadata: {
    timestamp: "2025-11-17T10:45:00Z",
    cycleId: "cycle-20241117-001",
    implementation: "minimal"
  }
}
```

---

### tdd_refactor

Refactor code while maintaining tests (REFACTOR phase).

#### Parameters

| Parameter       | Type    | Required | Description                             |
| --------------- | ------- | -------- | --------------------------------------- |
| `file`          | string  | ✅       | Path to file to refactor                |
| `code`          | string  | ✅       | Refactored code                         |
| `rationale`     | string  | ❌       | Reason for refactoring                  |
| `preserveTests` | boolean | ❌       | Ensure tests still pass (default: true) |

#### Example Request

```typescript
{
  tool: "tdd_refactor",
  arguments: {
    file: "./src/auth/authService.ts",
    rationale: "Add proper validation and error handling",
    preserveTests: true,
    code: `
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface TokenManager {
  generateAccessToken(userId: string): Promise<string>;
  generateRefreshToken(userId: string): Promise<string>;
}

export interface UserRepository {
  validateCredentials(username: string, password: string): Promise<{ valid: boolean; userId?: string }>;
}

export class AuthService {
  constructor(
    private tokenManager: TokenManager,
    private userRepository: UserRepository
  ) {}

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    // Validate input
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        error: 'Username and password are required'
      };
    }

    // Validate credentials
    const validation = await this.userRepository.validateCredentials(
      credentials.username,
      credentials.password
    );

    if (!validation.valid) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    // Generate tokens
    const accessToken = await this.tokenManager.generateAccessToken(validation.userId!);
    const refreshToken = await this.tokenManager.generateRefreshToken(validation.userId!);

    return {
      success: true,
      accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }
}
    `
  }
}
```

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_refactor",
  data: {
    refactored: true,
    file: "./src/auth/authService.ts",
    phase: "REFACTOR",
    summary: "Added validation and error handling while preserving test compatibility",
    nextAction: "run-tests",
    changes: [
      "Added input validation",
      "Added UserRepository dependency",
      "Improved error handling",
      "Enhanced type safety"
    ],
    codeAnalysis: {
      linesOfCode: 58,
      complexity: "medium",
      maintainabilityScore: 8.5,
      testCompatibility: "preserved"
    },
    testRequirements: [
      "Mock UserRepository in tests",
      "Add test cases for validation errors",
      "Update constructor calls in tests"
    ]
  },
  metadata: {
    timestamp: "2025-11-17T10:50:00Z",
    cycleId: "cycle-20241117-001",
    refactoring: "enhancement"
  }
}
```

## Workflow Management

### tdd_status

Get current TDD cycle status and recommended next action.

#### Parameters

None - returns current cycle status.

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_status",
  data: {
    activeCycle: {
      cycleId: "cycle-20241117-001",
      feature: "user-authentication",
      phase: "GREEN",
      currentStep: "run-tests-after-implementation",
      progress: {
        testsWritten: 3,
        testsPassing: 2,
        testsNeedingImplementation: 1,
        implementationProgress: 75
      }
    },
    recommendations: [
      "Run tests to verify latest implementation",
      "Address failing test: 'should handle invalid credentials'",
      "Consider adding edge case tests before refactoring"
    ],
    nextAction: "run-tests",
    history: [
      {
        timestamp: "2025-11-17T10:30:00Z",
        action: "init_cycle",
        phase: "RED"
      },
      {
        timestamp: "2025-11-17T10:35:00Z",
        action: "write_test",
        phase: "RED"
      },
      {
        timestamp: "2025-11-17T10:45:00Z",
        action: "implement",
        phase: "GREEN"
      }
    ]
  },
  metadata: {
    timestamp: "2025-11-17T10:55:00Z",
    activeSince: "2025-11-17T10:30:00Z",
    duration: 1500
  }
}
```

### tdd_complete_cycle

Mark TDD cycle as complete and generate summary.

#### Parameters

| Parameter   | Type     | Required | Description                  |
| ----------- | -------- | -------- | ---------------------------- |
| `notes`     | string   | ❌       | Optional completion notes    |
| `learnings` | string[] | ❌       | Key learnings from the cycle |

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_complete_cycle",
  data: {
    completed: true,
    cycleId: "cycle-20241117-001",
    feature: "user-authentication",
    summary: {
      duration: 3600,
      testsCreated: 5,
      testsPassing: 5,
      implementationFiles: 3,
      refactorings: 2,
      finalCoverage: {
        statements: 95,
        branches: 88,
        functions: 100,
        lines: 94
      }
    },
    artifacts: [
      "./test/auth/authentication.test.ts",
      "./test/auth/tokenManager.test.ts",
      "./src/auth/authService.ts",
      "./src/auth/tokenManager.ts",
      "./src/auth/userRepository.ts"
    ],
    learnings: [
      "Dependency injection made testing easier",
      "Starting with interfaces helped with TDD flow",
      "Edge case testing revealed important validation needs"
    ]
  },
  metadata: {
    timestamp: "2025-11-17T14:30:00Z",
    startTime: "2025-11-17T10:30:00Z",
    endTime: "2025-11-17T14:30:00Z"
  }
}
```

### tdd_checkpoint

Save current state for potential rollback.

#### Parameters

| Parameter     | Type   | Required | Description            |
| ------------- | ------ | -------- | ---------------------- |
| `description` | string | ✅       | Checkpoint description |

### tdd_rollback

Rollback to a previous checkpoint.

#### Parameters

| Parameter      | Type   | Required | Description                     |
| -------------- | ------ | -------- | ------------------------------- |
| `checkpointId` | string | ✅       | ID of checkpoint to rollback to |

## Analysis Tools

### tdd_coverage

Analyze test coverage metrics.

#### Parameters

| Parameter   | Type                              | Required | Description                  |
| ----------- | --------------------------------- | -------- | ---------------------------- |
| `path`      | string                            | ❌       | Path to analyze coverage for |
| `format`    | 'summary' \| 'detailed' \| 'html' | ❌       | Coverage report format       |
| `threshold` | number                            | ❌       | Minimum coverage threshold   |

#### Example Response

```typescript
{
  status: "success",
  tool: "tdd_coverage",
  data: {
    summary: "Coverage: 92% statements, 85% branches, 98% functions",
    overall: {
      statements: { covered: 184, total: 200, percentage: 92 },
      branches: { covered: 34, total: 40, percentage: 85 },
      functions: { covered: 49, total: 50, percentage: 98 },
      lines: { covered: 178, total: 195, percentage: 91.3 }
    },
    files: [
      {
        file: "./src/auth/authService.ts",
        statements: 95,
        branches: 88,
        functions: 100,
        lines: 94,
        uncoveredLines: [45, 67]
      }
    ],
    suggestions: [
      "Add tests for error handling on line 45",
      "Cover edge case branch on line 67",
      "Overall coverage meets 85% threshold"
    ]
  }
}
```

## Response Format

All TDD tools return responses in this standardized format:

```typescript
interface TDDToolResponse {
  status: 'success' | 'error';
  tool: string;
  data?: {
    summary: string;
    phase?: 'RED' | 'GREEN' | 'REFACTOR';
    nextAction?: string;
    recommendations?: string[];
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    cycleId?: string;
    testFramework?: string;
    language?: string;
    [key: string]: any;
  };
}
```

## Error Handling

### Error Response Format

```typescript
{
  status: "error",
  tool: "tdd_run_tests",
  error: {
    code: "TEST_EXECUTION_FAILED",
    message: "Test execution encountered an error",
    details: {
      command: "npm test",
      exitCode: 1,
      stderr: "Test suite failed to run",
      stdout: "..."
    }
  },
  metadata: {
    timestamp: "2025-11-17T11:00:00Z",
    cycleId: "cycle-20241117-001"
  }
}
```

### Common Error Codes

| Code                      | Description                 | Resolution                         |
| ------------------------- | --------------------------- | ---------------------------------- |
| `CYCLE_NOT_INITIALIZED`   | No active TDD cycle         | Run tdd_init_cycle first           |
| `TEST_EXECUTION_FAILED`   | Test runner error           | Check test syntax and dependencies |
| `INVALID_TEST_CODE`       | Test code syntax error      | Validate test code syntax          |
| `FILE_NOT_FOUND`          | Implementation file missing | Verify file path                   |
| `PHASE_VIOLATION`         | Wrong phase for action      | Follow RED-GREEN-REFACTOR cycle    |
| `FRAMEWORK_NOT_SUPPORTED` | Unsupported test framework  | Use jest, vitest, or mocha         |
| `COVERAGE_TOOL_ERROR`     | Coverage collection failed  | Install coverage tools             |

## Configuration

### TDD Configuration

Create `tdd.config.json` in your project root:

```json
{
  "framework": {
    "default": "vitest",
    "supported": ["jest", "vitest", "mocha"],
    "config": {
      "vitest": {
        "configFile": "vitest.config.ts",
        "coverage": {
          "provider": "c8",
          "reporter": ["text", "html", "lcov"]
        }
      },
      "jest": {
        "configFile": "jest.config.js",
        "coverage": {
          "collectCoverageFrom": ["src/**/*.{js,ts,tsx}"],
          "threshold": {
            "global": {
              "statements": 80,
              "branches": 75,
              "functions": 85,
              "lines": 80
            }
          }
        }
      }
    }
  },
  "cycle": {
    "autoSave": true,
    "checkpointFrequency": 300,
    "maxCycleDuration": 14400,
    "requireGreenBeforeRefactor": true
  },
  "paths": {
    "testDir": "./test",
    "srcDir": "./src",
    "coverageDir": "./coverage"
  },
  "validation": {
    "enforceNaming": true,
    "testFilePattern": "**/*.test.{js,ts,tsx}",
    "minTestsPerCycle": 1,
    "maxComplexityPerFunction": 10
  }
}
```

### Environment Variables

| Variable                 | Default      | Description                  |
| ------------------------ | ------------ | ---------------------------- |
| `TDD_FRAMEWORK`          | `vitest`     | Default test framework       |
| `TDD_LANGUAGE`           | `typescript` | Default programming language |
| `TDD_AUTO_SAVE`          | `true`       | Auto-save cycle progress     |
| `TDD_STRICT_MODE`        | `false`      | Enforce strict TDD rules     |
| `TDD_COVERAGE_THRESHOLD` | `80`         | Minimum coverage percentage  |

### Integration Examples

### With mcp-consult

```typescript
// Get AI guidance during TDD
const guidance = await runTool('consult_ollama', {
  prompt: `
    I'm in the RED phase of TDD for user authentication.
    My test is failing with: ${testResults.failures[0].error}
    
    What's the minimal implementation to make this test pass?
  `,
  model: 'qwen2.5-coder:7b',
  context: {
    code: testCode,
    language: 'typescript',
  },
});

await runTool('tdd_implement', {
  file: './src/auth/authService.ts',
  code: guidance.suggestion,
});
```

### With mcp-optimist

```typescript
// Optimize after completing TDD cycle
await runTool('tdd_complete_cycle', {
  notes: 'Feature complete, ready for optimization',
});

const optimizationResults = await runTool('analyze_performance', {
  path: './src/auth',
  threshold: 'medium',
});

// Use optimization results in next TDD cycle
await runTool('tdd_init_cycle', {
  feature: 'auth-performance-optimization',
  description: `Optimize authentication performance: ${JSON.stringify(optimizationResults.suggestions)}`,
});
```

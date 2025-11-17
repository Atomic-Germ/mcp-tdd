# MCP-TDD Refactoring & Modernization Plan

**Status**: Planning Phase  
**Target Completion**: 6 weeks  
**Current Coverage**: 14 tests → **Target**: 80%+ coverage  
**Methodology**: Test-Driven Refactoring with AI Consultation

---

## Executive Summary

Based on AI consultation (Qwen3-Coder 480B) and analysis from mcp-optimist tools, we have identified critical areas for improvement in the mcp-tdd codebase. This plan leverages lessons learned from successfully refactoring mcp-optimist and mcp-consult.

### Current State Analysis

**Codebase Metrics:**

- **tddHandlers.ts**: 1,049 lines (MONOLITHIC - needs splitting)
- **tddState.ts**: 268 lines (acceptable)
- **tddUtils.ts**: 349 lines (could be modularized)
- **Test Coverage**: ~14 tests (INSUFFICIENT)
- **Tooling**: Basic (no linting, formatting, or hooks)
- **Documentation**: Good README but could be enhanced

**Critical Issues Identified:**

1. ⚠️ **Monolithic handler file** - maintainability nightmare
2. ⚠️ **Low test coverage** - regression risk
3. ⚠️ **No code quality tools** - consistency issues
4. ⚠️ **No CI/CD pipeline** - manual deployment
5. ⚠️ **Limited modularity** - tight coupling

---

## Phase 1: Foundation & Tooling (Week 1)

### Objectives

- Establish modern development tooling
- Create CI/CD pipeline
- Set quality gates

### Tasks

#### 1.1 Add Development Tools

```bash
pnpm add -D \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  prettier eslint-config-prettier eslint-plugin-prettier \
  husky lint-staged \
  @vitest/coverage-v8
```

#### 1.2 Configuration Files

**`.eslintrc.json`**

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

**`.prettierrc`**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**`package.json` scripts**

```json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write 'src/**/*.ts'",
    "format:check": "prettier --check 'src/**/*.ts'",
    "test:coverage": "vitest run --coverage",
    "prepare": "husky install"
  }
}
```

#### 1.3 GitHub Actions CI/CD

**`.github/workflows/ci.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run format:check

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build

  release:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
```

**Deliverables:**

- ✅ ESLint configured and passing
- ✅ Prettier configured
- ✅ Husky pre-commit hooks
- ✅ CI/CD pipeline operational
- ✅ Coverage reporting enabled

---

## Phase 2: Handler Modularization (Week 2)

### Objectives

- Break down monolithic `tddHandlers.ts`
- Improve separation of concerns
- Maintain backward compatibility

### New File Structure

```
src/
├── index.ts (entry point)
├── handlers/
│   ├── index.ts (exports all handlers)
│   ├── initCycleHandler.ts
│   ├── writeTestHandler.ts
│   ├── runTestsHandler.ts
│   ├── implementHandler.ts
│   ├── refactorHandler.ts
│   ├── statusHandler.ts
│   ├── completeCycleHandler.ts
│   ├── consultHandler.ts
│   ├── checkpointHandler.ts
│   ├── rollbackHandler.ts
│   ├── coverageHandler.ts
│   ├── compareApproachesHandler.ts
│   └── listToolsHandler.ts
├── services/
│   ├── testExecutionService.ts (from testExecutionUtils.ts)
│   ├── fileWriterService.ts (from testFileWriter.ts)
│   ├── externalAPIService.ts (already exists)
│   └── prioritizationService.ts (from testPrioritization.ts)
├── state/
│   ├── tddStateManager.ts (refactored from tddState.ts)
│   └── stateTypes.ts
├── utils/
│   ├── validationUtils.ts
│   ├── fileUtils.ts
│   ├── testUtils.ts
│   └── formatUtils.ts
├── types/
│   ├── index.ts
│   ├── tddTypes.ts (existing)
│   └── handlerTypes.ts (new)
└── constants/
    └── tddConstants.ts
```

### Migration Strategy

**Step 1: Extract Tool Definitions**

```typescript
// src/handlers/listToolsHandler.ts
export function getToolDefinitions() {
  return {
    tools: [
      getTDDInitCycleTool(),
      getTDDWriteTestTool(),
      getTDDRunTestsTool(),
      // ... etc
    ],
  };
}
```

**Step 2: Create Individual Handlers**

```typescript
// src/handlers/initCycleHandler.ts
import { TDDCycle } from '../types/tddTypes.js';
import { setActiveCycle, generateId } from '../state/tddStateManager.js';

export async function handleInitCycle(args: {
  feature: string;
  description: string;
  testFramework?: string;
  language?: string;
  files?: string[];
}) {
  const cycle: TDDCycle = {
    id: generateId('cycle'),
    feature: args.feature,
    description: args.description,
    phase: 'READY',
    startTime: Date.now(),
    testFramework: args.testFramework || 'vitest',
    language: args.language || 'typescript',
    files: args.files || [],
    tests: [],
    implementations: [],
    refactorings: [],
  };

  setActiveCycle(cycle);

  return {
    content: [
      {
        type: 'text',
        text:
          `✅ TDD Cycle initialized: ${cycle.id}\n\n` +
          `Feature: ${cycle.feature}\n` +
          `Phase: READY → Ready to write tests\n\n` +
          `Next: Use tdd_write_test to create your first failing test (RED phase)`,
      },
    ],
  };
}
```

**Step 3: Update Main Handler Router**

```typescript
// src/handlers/index.ts
import { handleInitCycle } from './initCycleHandler.js';
import { handleWriteTest } from './writeTestHandler.js';
// ... import all handlers

export async function routeToolCall(name: string, args: any) {
  switch (name) {
    case 'tdd_init_cycle':
      return handleInitCycle(args);
    case 'tdd_write_test':
      return handleWriteTest(args);
    // ... route all tools
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

**Deliverables:**

- ✅ Each tool in separate handler file (<100 lines each)
- ✅ Clear separation of concerns
- ✅ All tests still passing
- ✅ No API changes (backward compatible)

---

## Phase 3: Comprehensive Testing (Week 3-4)

### Objectives

- Achieve 80%+ code coverage
- Add unit tests for all handlers
- Add integration tests for workflows
- Add edge case tests

### Test Structure

```
test/
├── unit/
│   ├── handlers/
│   │   ├── initCycleHandler.test.ts
│   │   ├── writeTestHandler.test.ts
│   │   ├── runTestsHandler.test.ts
│   │   ├── implementHandler.test.ts
│   │   ├── refactorHandler.test.ts
│   │   ├── statusHandler.test.ts
│   │   ├── completeCycleHandler.test.ts
│   │   ├── consultHandler.test.ts
│   │   ├── checkpointHandler.test.ts
│   │   ├── rollbackHandler.test.ts
│   │   ├── coverageHandler.test.ts
│   │   └── compareApproachesHandler.test.ts
│   ├── services/
│   │   ├── testExecutionService.test.ts
│   │   ├── fileWriterService.test.ts
│   │   ├── externalAPIService.test.ts
│   │   └── prioritizationService.test.ts
│   ├── state/
│   │   └── tddStateManager.test.ts
│   └── utils/
│       ├── validationUtils.test.ts
│       ├── fileUtils.test.ts
│       └── testUtils.test.ts
├── integration/
│   ├── fullTDDWorkflow.test.ts
│   ├── checkpointRollback.test.ts
│   ├── consultIntegration.test.ts
│   └── multiCycle.test.ts
└── fixtures/
    ├── sampleTests/
    ├── sampleCode/
    └── mockState/
```

### Coverage Goals

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: ['node_modules/', 'dist/', 'test/', '**/*.d.ts', 'src/types/'],
    },
  },
});
```

### Test Templates

**Unit Test Template**

```typescript
// test/unit/handlers/initCycleHandler.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleInitCycle } from '../../src/handlers/initCycleHandler.js';
import * as stateManager from '../../src/state/tddStateManager.js';

describe('initCycleHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize a new TDD cycle with required fields', async () => {
    const setActiveCycleSpy = vi.spyOn(stateManager, 'setActiveCycle');

    const result = await handleInitCycle({
      feature: 'user-auth',
      description: 'Implement user authentication',
    });

    expect(setActiveCycleSpy).toHaveBeenCalled();
    expect(result.content[0].text).toContain('TDD Cycle initialized');
  });

  it('should use default values for optional fields', async () => {
    const result = await handleInitCycle({
      feature: 'test-feature',
      description: 'Test description',
    });

    // Verify defaults are applied
  });

  it('should throw error with missing required fields', async () => {
    await expect(handleInitCycle({} as any)).rejects.toThrow();
  });
});
```

**Integration Test Template**

```typescript
// test/integration/fullTDDWorkflow.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { handleInitCycle } from '../../src/handlers/initCycleHandler.js';
import { handleWriteTest } from '../../src/handlers/writeTestHandler.js';
import { handleRunTests } from '../../src/handlers/runTestsHandler.js';
import { handleImplement } from '../../src/handlers/implementHandler.js';

describe('Full TDD Workflow Integration', () => {
  it('should complete RED-GREEN-REFACTOR cycle', async () => {
    // 1. Initialize cycle
    await handleInitCycle({
      feature: 'email-validation',
      description: 'Validate email addresses',
    });

    // 2. Write failing test (RED)
    await handleWriteTest({
      testFile: 'test/email.test.ts',
      testName: 'should validate email format',
      testCode:
        'test("should validate email", () => { expect(validateEmail("test@example.com")).toBe(true); })',
      expectedToFail: true,
    });

    // 3. Run tests (should fail)
    const redResult = await handleRunTests({ expectation: 'fail' });
    expect(redResult.content[0].text).toContain('RED phase confirmed');

    // 4. Implement code (GREEN)
    await handleImplement({
      implementationFile: 'src/email.ts',
      code: 'export function validateEmail(email: string) { return /^[^@]+@[^@]+$/.test(email); }',
      testsCovered: ['should validate email format'],
    });

    // 5. Run tests (should pass)
    const greenResult = await handleRunTests({ expectation: 'pass' });
    expect(greenResult.content[0].text).toContain('GREEN phase confirmed');
  });
});
```

**Deliverables:**

- ✅ 80%+ code coverage
- ✅ All handlers have unit tests
- ✅ Integration tests for key workflows
- ✅ Edge cases covered
- ✅ Mock external dependencies

---

## Phase 4: Documentation Enhancement (Week 5)

### Objectives

- Create comprehensive README similar to mcp-optimist
- Add inline code documentation
- Create usage examples
- Add troubleshooting guide

### Documentation Structure

**Enhanced README.md**

```markdown
# MCP TDD - Test-Driven Development Server

[![CI/CD](https://github.com/user/mcp-tdd/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/user/mcp-tdd/actions)
[![Coverage](https://codecov.io/gh/user/mcp-tdd/branch/main/graph/badge.svg)](https://codecov.io/gh/user/mcp-tdd)
[![npm version](https://badge.fury.io/js/mcp-tdd.svg)](https://www.npmjs.com/package/mcp-tdd)

A comprehensive MCP (Model Context Protocol) server that provides structured tools and workflows for robust Test-Driven Development.

## Features

🎯 **Complete TDD Workflow**

- RED-GREEN-REFACTOR cycle enforcement
- Automated test execution
- Coverage tracking

🔧 **12 Powerful Tools**

- Cycle management
- Test generation
- Implementation guidance
- Refactoring support

🤖 **AI Integration**

- Ollama consultation for complex decisions
- Smart next-action recommendations

📊 **State Management**

- Checkpoint/rollback support
- Persistent state across sessions

## Quick Start

[... rest of enhanced README content ...]
```

**API Documentation (TOOLS.md)**

```markdown
# MCP-TDD Tools Reference

Complete reference for all 12 TDD tools with examples.

## Tool Categories

### Cycle Management

- tdd_init_cycle
- tdd_status
- tdd_complete_cycle

### Test Phase (RED)

- tdd_write_test
- tdd_run_tests

[... detailed documentation for each tool ...]
```

**Troubleshooting Guide (TROUBLESHOOTING.md)**

```markdown
# Troubleshooting Guide

## Common Issues

### Tests Not Running

**Symptom**: `tdd_run_tests` returns "No test framework found"
**Solution**: Set TEST_FRAMEWORK environment variable or specify in tdd_init_cycle

[... more troubleshooting scenarios ...]
```

**Deliverables:**

- ✅ Enhanced README with badges
- ✅ Comprehensive tool documentation
- ✅ Troubleshooting guide
- ✅ Code examples
- ✅ Architecture diagrams

---

## Phase 5: Performance & Quality (Week 6)

### Objectives

- Optimize performance bottlenecks
- Add error handling improvements
- Add logging and monitoring
- Final quality checks

### Performance Optimizations

**State Management**

```typescript
// Implement caching for frequently accessed state
class TDDStateManager {
  private cache = new Map();

  getState(): TDDState {
    if (this.cache.has('state')) {
      return this.cache.get('state');
    }
    const state = this.loadState();
    this.cache.set('state', state);
    return state;
  }
}
```

**Test Execution**

```typescript
// Add timeout and streaming for large test suites
async function runTests(pattern?: string, timeout = 300000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await executeTestsWithAbort(pattern, controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Enhanced Error Handling

```typescript
// src/utils/errorHandler.ts
export class TDDError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'TDDError';
  }
}

export function handleError(error: unknown) {
  if (error instanceof TDDError) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ ${error.message}\n\nCode: ${error.code}\n\nSuggestion: ${getErrorSuggestion(error.code)}`,
        },
      ],
      isError: true,
    };
  }
  // Handle other error types
}
```

### Logging

```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  constructor(private level: LogLevel = LogLevel.INFO) {}

  debug(message: string, meta?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }

  // ... other log methods
}
```

**Deliverables:**

- ✅ Performance optimizations applied
- ✅ Comprehensive error handling
- ✅ Structured logging
- ✅ All quality gates passing

---

## Success Metrics

### Code Quality

- ✅ Test coverage ≥ 80%
- ✅ All linting rules passing
- ✅ Zero TypeScript errors
- ✅ Prettier formatting applied

### Architecture

- ✅ No file > 200 lines
- ✅ Cyclomatic complexity < 10
- ✅ Clear separation of concerns
- ✅ DRY principles applied

### Documentation

- ✅ README comprehensive
- ✅ All tools documented
- ✅ Examples provided
- ✅ Troubleshooting guide complete

### CI/CD

- ✅ Automated testing on PR
- ✅ Automated releases
- ✅ Coverage reporting
- ✅ Build artifacts published

---

## Migration Guide

### For Existing Users

The refactoring maintains backward compatibility. No changes required to existing MCP configurations.

### For Contributors

1. Run `pnpm install` to get new dev dependencies
2. Run `pnpm run prepare` to setup Husky hooks
3. Use `pnpm run lint:fix` before committing
4. Ensure tests pass: `pnpm run test`

---

## Risk Mitigation

### Backward Compatibility

- All existing tool signatures maintained
- Legacy adapter layer if needed
- Extensive integration testing

### Regression Prevention

- Comprehensive test suite
- CI/CD enforcement
- Manual QA on critical paths

### Performance

- Benchmark critical operations
- Monitor memory usage
- Profile test execution

---

## Timeline Summary

| Week | Phase          | Key Deliverables |
| ---- | -------------- | ---------------- |
| 1    | Foundation     | Tooling, CI/CD   |
| 2    | Modularization | Split handlers   |
| 3-4  | Testing        | 80%+ coverage    |
| 5    | Documentation  | Enhanced docs    |
| 6    | Quality        | Optimizations    |

**Total Duration**: 6 weeks  
**Estimated Effort**: 120-150 hours  
**Risk Level**: Low (backward compatible)

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Initialize Phase 1** with tooling setup
3. **Use mcp-tdd itself** to implement changes (dogfooding)
4. **Consult with ollama-consult** for architecture decisions
5. **Use mcp-optimist** to validate code quality

---

**Document Version**: 1.0  
**Created**: 2025-11-17  
**Author**: AI Refactoring Team (Qwen3-Coder + GPT-4)  
**Status**: Ready for Implementation

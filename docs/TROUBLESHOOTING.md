# TDD MCP Server - Troubleshooting Guide

Comprehensive troubleshooting guide for Test-Driven Development workflow issues.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [TDD Cycle Issues](#tdd-cycle-issues)
- [Test Execution Problems](#test-execution-problems)
- [Framework-Specific Issues](#framework-specific-issues)
- [Implementation Issues](#implementation-issues)
- [Coverage Analysis Problems](#coverage-analysis-problems)
- [Integration Issues](#integration-issues)
- [Error Reference](#error-reference)
- [Best Practices](#best-practices)

## Quick Diagnostics

### Health Check Commands

Verify TDD MCP Server is working correctly:

```bash
# Basic health check
mcp-tdd --version

# Test framework detection
mcp-tdd detect-framework --path ./

# Simple cycle test
mcp-tdd tdd_init_cycle --feature "test-feature" --description "Testing TDD server"

# Check current status
mcp-tdd tdd_status

# Verbose logging
DEBUG=mcp:tdd mcp-tdd tdd_run_tests --verbose
```

### Common Quick Fixes

| Issue                 | Quick Fix                  | Command                                    |
| --------------------- | -------------------------- | ------------------------------------------ |
| Server not found      | Reinstall package          | `npm install -g @mcp/tdd`                  |
| No framework detected | Install test framework     | `npm install vitest` or `npm install jest` |
| Tests not running     | Check package.json scripts | Add `"test": "vitest"`                     |
| Cycle not active      | Initialize cycle           | `tdd_init_cycle --feature "name"`          |
| Permission denied     | Fix permissions            | `chmod +x ./test/**/*.test.ts`             |

## TDD Cycle Issues

### Issue: "No active TDD cycle found"

**Symptoms:**

```json
{
  "status": "error",
  "error": {
    "code": "CYCLE_NOT_INITIALIZED",
    "message": "No active TDD cycle found. Initialize a cycle first."
  }
}
```

**Debugging Steps:**

1. **Check for existing cycles:**

```bash
mcp-tdd tdd_status
```

2. **List cycle history:**

```bash
ls -la ./.tdd-cycles/
cat ./.tdd-cycles/current-cycle.json
```

3. **Check permissions:**

```bash
ls -la ./.tdd-cycles/
```

**Solutions:**

1. **Initialize a new cycle:**

```typescript
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "my-feature",
    description: "Implementing my feature using TDD"
  }
}
```

2. **Restore from backup:**

```bash
# If cycle file exists but corrupted
cp ./.tdd-cycles/backup-cycle.json ./.tdd-cycles/current-cycle.json
```

3. **Fix permissions:**

```bash
mkdir -p ./.tdd-cycles
chmod 755 ./.tdd-cycles
```

### Issue: "Phase violation - wrong step for current phase"

**Symptoms:**

```json
{
  "status": "error",
  "error": {
    "code": "PHASE_VIOLATION",
    "message": "Cannot implement code during RED phase without failing tests"
  }
}
```

**Debugging Steps:**

1. **Check current phase:**

```bash
mcp-tdd tdd_status
```

2. **Review cycle history:**

```bash
cat ./.tdd-cycles/current-cycle.json | jq '.history'
```

**Solutions:**

1. **Follow proper TDD flow:**

```typescript
// RED phase: Write failing test first
{
  tool: "tdd_write_test",
  arguments: {
    testFile: "./test/feature.test.ts",
    testName: "should do something",
    testCode: "// test code"
  }
}

// Run test to confirm it fails
{
  tool: "tdd_run_tests",
  arguments: {
    expectation: "fail"
  }
}

// GREEN phase: Now implement
{
  tool: "tdd_implement",
  arguments: {
    file: "./src/feature.ts",
    code: "// minimal implementation"
  }
}
```

2. **Reset cycle if stuck:**

```bash
mcp-tdd tdd_rollback --checkpoint-id "last-working-checkpoint"
```

### Issue: "Cycle timeout - exceeded maximum duration"

**Symptoms:**

- Cycle automatically terminated
- Warning about long-running cycle

**Solutions:**

1. **Increase timeout in config:**

```json
{
  "cycle": {
    "maxCycleDuration": 28800, // 8 hours instead of 4
    "autoSave": true,
    "checkpointFrequency": 600 // Checkpoint every 10 minutes
  }
}
```

2. **Break into smaller cycles:**

```typescript
// Complete current feature
{
  tool: "tdd_complete_cycle",
  arguments: {
    notes: "Completed basic functionality"
  }
}

// Start new cycle for next part
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "feature-part-2",
    description: "Next iteration of the feature"
  }
}
```

## Test Execution Problems

### Issue: "Test execution failed"

**Symptoms:**

```json
{
  "status": "error",
  "error": {
    "code": "TEST_EXECUTION_FAILED",
    "message": "Test runner encountered an error",
    "details": {
      "command": "npm test",
      "exitCode": 1,
      "stderr": "Cannot find module 'vitest'"
    }
  }
}
```

**Debugging Steps:**

1. **Verify test framework installation:**

```bash
npm list vitest
npm list jest
npm list mocha
```

2. **Check package.json scripts:**

```bash
cat package.json | jq '.scripts'
```

3. **Test manually:**

```bash
npx vitest run
npx jest
npm test
```

**Solutions:**

1. **Install missing framework:**

```bash
# For Vitest
npm install --save-dev vitest @vitest/ui

# For Jest
npm install --save-dev jest @types/jest

# For Mocha
npm install --save-dev mocha chai @types/mocha @types/chai
```

2. **Fix package.json scripts:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

3. **Configure test framework:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'test/'],
    },
  },
});
```

### Issue: "Tests not found or not matching pattern"

**Symptoms:**

- Zero tests executed
- No test files found

**Debugging Steps:**

1. **Check test file patterns:**

```bash
find . -name "*.test.ts" -o -name "*.test.js" -o -name "*.spec.ts"
```

2. **Verify test file structure:**

```bash
ls -la ./test/
ls -la ./src/__tests__/
```

3. **Check framework configuration:**

```bash
cat vitest.config.ts
cat jest.config.js
```

**Solutions:**

1. **Fix file naming:**

```bash
# Ensure proper test file extensions
mv ./test/mytest.ts ./test/mytest.test.ts
```

2. **Update test patterns:**

```json
// vitest.config.ts
{
  "test": {
    "include": ["**/*.{test,spec}.{js,ts,tsx}"]
  }
}

// jest.config.js
{
  "testMatch": ["**/__tests__/**/*.(js|ts)", "**/*.(test|spec).(js|ts)"]
}
```

3. **Verify test content:**

```typescript
// Ensure tests have proper structure
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### Issue: "Module resolution errors in tests"

**Symptoms:**

```
Cannot find module '../src/myModule'
Cannot resolve module './utils'
```

**Solutions:**

1. **Fix import paths:**

```typescript
// Wrong - relative path issues
import { MyClass } from '../src/myClass';

// Correct - proper relative paths
import { MyClass } from '../../src/myClass';

// Or use absolute imports with path mapping
import { MyClass } from '@/src/myClass';
```

2. **Configure path mapping:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@test/*": ["./test/*"]
    }
  }
}

// vitest.config.ts
{
  "resolve": {
    "alias": {
      "@": path.resolve(__dirname, "./src"),
      "@test": path.resolve(__dirname, "./test")
    }
  }
}
```

## Framework-Specific Issues

### Vitest Issues

#### Issue: "Vitest hanging or not exiting"

**Solutions:**

1. **Add proper configuration:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
```

2. **Check for async operations:**

```typescript
// Ensure all async operations are awaited
it('should complete async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

#### Issue: "Vitest coverage not working"

**Solutions:**

1. **Install coverage provider:**

```bash
npm install --save-dev @vitest/coverage-c8
# or
npm install --save-dev @vitest/coverage-istanbul
```

2. **Configure coverage:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'test/', '**/*.d.ts', '**/*.test.ts'],
    },
  },
});
```

### Jest Issues

#### Issue: "Jest transform errors"

**Solutions:**

1. **Configure TypeScript transform:**

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js']
};
```

2. **Install required dependencies:**

```bash
npm install --save-dev ts-jest @types/jest
```

#### Issue: "Jest ES modules error"

**Solutions:**

1. **Configure for ES modules:**

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
```

2. **Update package.json:**

```json
{
  "type": "module",
  "scripts": {
    "test": "NODE_OPTIONS=--experimental-vm-modules jest"
  }
}
```

## Implementation Issues

### Issue: "Cannot write to implementation file"

**Symptoms:**

- File permission errors
- Directory doesn't exist
- File locked or in use

**Solutions:**

1. **Fix permissions:**

```bash
chmod 644 ./src/**/*.ts
chmod 755 ./src/
```

2. **Create directories:**

```bash
mkdir -p ./src/components
mkdir -p ./src/services
```

3. **Check file locks:**

```bash
lsof ./src/myfile.ts
```

### Issue: "Implementation doesn't make tests pass"

**Debugging Steps:**

1. **Run tests with verbose output:**

```bash
npm test -- --verbose
```

2. **Check test expectations:**

```bash
mcp-tdd tdd_run_tests --verbose --testPattern "specific-test"
```

3. **Verify implementation matches test:**

```typescript
// Review test requirements
it('should return user data', () => {
  const result = userService.getUser('123');
  expect(result).toEqual({
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
  });
});

// Ensure implementation provides exactly what test expects
class UserService {
  getUser(id: string) {
    return {
      id: id,
      name: 'John Doe',
      email: 'john@example.com',
    };
  }
}
```

**Solutions:**

1. **Start with minimal implementation:**

```typescript
// Make test pass with minimal code
class Calculator {
  add(a: number, b: number): number {
    return 5; // Hardcode to make specific test pass
  }
}
```

2. **Gradually add functionality:**

```typescript
// Expand implementation as more tests are added
class Calculator {
  add(a: number, b: number): number {
    return a + b; // Proper implementation after multiple tests
  }
}
```

## Coverage Analysis Problems

### Issue: "Coverage not collected"

**Debugging Steps:**

1. **Check coverage configuration:**

```bash
cat vitest.config.ts | grep -A 10 coverage
cat jest.config.js | grep -A 10 coverage
```

2. **Verify coverage tools:**

```bash
npm list @vitest/coverage-c8
npm list @vitest/coverage-istanbul
```

**Solutions:**

1. **Install coverage tools:**

```bash
# For Vitest
npm install --save-dev @vitest/coverage-c8

# For Jest
npm install --save-dev jest-coverage-badges
```

2. **Run with coverage flag:**

```bash
npm test -- --coverage
vitest --coverage
```

3. **Configure coverage thresholds:**

```typescript
// vitest.config.ts
{
  test: {
    coverage: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
```

### Issue: "Coverage reports inaccurate"

**Solutions:**

1. **Exclude irrelevant files:**

```typescript
{
  coverage: {
    exclude: [
      'node_modules/',
      'test/',
      'coverage/',
      '**/*.d.ts',
      '**/*.config.ts',
      '**/index.ts', // barrel exports
    ];
  }
}
```

2. **Include only source files:**

```typescript
{
  coverage: {
    include: ['src/**/*.ts', 'src/**/*.tsx'],
    exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
  }
}
```

## Integration Issues

### MCP Client Connection Issues

**Issue: Cannot connect to TDD server**

**Solutions:**

1. **Verify server configuration:**

```json
// Claude Desktop config
{
  "mcpServers": {
    "tdd": {
      "command": "npx",
      "args": ["-y", "@mcp/tdd"]
    }
  }
}
```

2. **Check server status:**

```bash
ps aux | grep mcp-tdd
netstat -tlnp | grep 3003
```

3. **Debug connection:**

```bash
DEBUG=mcp:* npx @mcp/tdd
```

### Integration with mcp-consult

**Issue: Cannot get AI guidance during TDD**

**Solutions:**

1. **Ensure both servers running:**

```json
{
  "mcpServers": {
    "tdd": {
      "command": "npx",
      "args": ["-y", "@mcp/tdd"]
    },
    "consult": {
      "command": "npx",
      "args": ["-y", "@mcp/consult"]
    }
  }
}
```

2. **Sequence operations correctly:**

```typescript
// Get test failure first
const testResult = await runTool('tdd_run_tests', {
  expectation: 'fail',
});

// Then ask for guidance
const guidance = await runTool('consult_ollama', {
  prompt: `My test is failing: ${testResult.failures[0].error}. What should I implement?`,
  context: { testCode: currentTest },
});
```

### Integration with mcp-optimist

**Issue: Performance analysis after TDD implementation**

**Solutions:**

1. **Complete TDD cycle first:**

```typescript
await runTool('tdd_complete_cycle', {
  notes: 'Feature implementation complete',
});
```

2. **Then analyze performance:**

```typescript
const analysis = await runTool('analyze_performance', {
  path: './src/feature-directory',
});
```

3. **Start optimization cycle:**

```typescript
await runTool('tdd_init_cycle', {
  feature: 'feature-optimization',
  description: `Optimize based on analysis: ${analysis.suggestions.join(', ')}`,
});
```

## Error Reference

### Complete Error Code Reference

| Error Code                | Description                    | Common Causes                    | Solutions                         |
| ------------------------- | ------------------------------ | -------------------------------- | --------------------------------- |
| `CYCLE_NOT_INITIALIZED`   | No active TDD cycle            | First tool call without init     | Run tdd_init_cycle                |
| `PHASE_VIOLATION`         | Wrong action for current phase | Skipping TDD steps               | Follow RED-GREEN-REFACTOR         |
| `TEST_EXECUTION_FAILED`   | Test runner error              | Missing framework, syntax errors | Install framework, fix syntax     |
| `FRAMEWORK_NOT_SUPPORTED` | Unsupported test framework     | Using unknown framework          | Use jest, vitest, or mocha        |
| `FILE_WRITE_ERROR`        | Cannot write implementation    | Permission issues                | Fix file permissions              |
| `INVALID_TEST_CODE`       | Test syntax error              | Malformed test code              | Validate test syntax              |
| `COVERAGE_ERROR`          | Coverage collection failed     | Missing coverage tools           | Install coverage providers        |
| `TIMEOUT`                 | Operation timeout              | Long-running tests               | Increase timeout, optimize tests  |
| `MODULE_NOT_FOUND`        | Import resolution failed       | Incorrect paths, missing deps    | Fix imports, install dependencies |
| `CHECKPOINT_ERROR`        | Checkpoint save/restore failed | Disk space, permissions          | Check disk space and permissions  |

### Debug Information Collection

When reporting issues, collect this debug information:

```bash
#!/bin/bash
# tdd-debug-info.sh

echo "=== TDD MCP Server Debug Information ==="

echo -e "\n=== System Information ==="
uname -a
node --version
npm --version

echo -e "\n=== TDD Server Information ==="
mcp-tdd --version 2>/dev/null || echo "TDD server not found"

echo -e "\n=== Package Information ==="
npm list @mcp/tdd 2>/dev/null || echo "Package not installed"
cat package.json | jq '.scripts' 2>/dev/null || echo "No package.json found"

echo -e "\n=== Test Framework Detection ==="
npm list vitest jest mocha 2>/dev/null || echo "No test frameworks found"

echo -e "\n=== TDD Configuration ==="
cat tdd.config.json 2>/dev/null || echo "No TDD config file found"

echo -e "\n=== Current TDD Status ==="
cat ./.tdd-cycles/current-cycle.json 2>/dev/null || echo "No active cycle found"

echo -e "\n=== Recent Test Output ==="
npm test 2>&1 | tail -n 20 || echo "Cannot run tests"

echo -e "\n=== File Structure ==="
find ./test -name "*.test.ts" -o -name "*.test.js" 2>/dev/null | head -10
find ./src -name "*.ts" -o -name "*.js" 2>/dev/null | head -10

echo -e "\n=== Environment Variables ==="
env | grep -E "(TDD|TEST|NODE)" || echo "No relevant environment variables"

echo -e "\n=== Permissions Check ==="
ls -la ./test/ 2>/dev/null || echo "Test directory not accessible"
ls -la ./src/ 2>/dev/null || echo "Source directory not accessible"
ls -la ./.tdd-cycles/ 2>/dev/null || echo "TDD cycles directory not found"
```

## Best Practices

### TDD Workflow Best Practices

1. **Always start with failing tests:**

```typescript
// ✅ Good: Write failing test first
{
  tool: "tdd_write_test",
  arguments: {
    testName: "should do something",
    expectedToFail: true
  }
}

// ❌ Bad: Writing implementation first
{
  tool: "tdd_implement"  // Without failing test
}
```

2. **Keep cycles small and focused:**

```typescript
// ✅ Good: Small, focused feature
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "user-login-validation",
    description: "Validate user email format during login"
  }
}

// ❌ Bad: Too broad
{
  tool: "tdd_init_cycle",
  arguments: {
    feature: "entire-user-system",
    description: "Complete user management system"
  }
}
```

3. **Write minimal implementations:**

```typescript
// ✅ Good: Minimal implementation
class Calculator {
  add(a: number, b: number): number {
    return 5; // Just make the test pass
  }
}

// ❌ Bad: Over-implementation
class Calculator {
  add(a: number, b: number): number {
    // Complex validation, logging, error handling
    // when test only needs basic addition
    return a + b;
  }
}
```

### Testing Best Practices

1. **Use descriptive test names:**

```typescript
// ✅ Good: Descriptive
it('should return 400 error when email format is invalid', () => {

// ❌ Bad: Vague
it('should work', () => {
```

2. **Test one thing at a time:**

```typescript
// ✅ Good: Single responsibility
it('should validate email format', () => {
  expect(validateEmail('invalid')).toBe(false);
});

it('should validate password length', () => {
  expect(validatePassword('123')).toBe(false);
});

// ❌ Bad: Multiple responsibilities
it('should validate user input', () => {
  // Testing email, password, name, etc. all in one test
});
```

3. **Use proper mocking:**

```typescript
// ✅ Good: Mock external dependencies
const mockDatabase = {
  findUser: vi.fn().mockResolvedValue(mockUser),
};

// ❌ Bad: Testing real database
const database = new RealDatabase(); // Slow, unreliable
```

### Troubleshooting Prevention

1. **Regular checkpoints:**

```typescript
{
  tool: "tdd_checkpoint",
  arguments: {
    description: "Completed user validation feature"
  }
}
```

2. **Frequent test runs:**

```bash
# Run tests after each change
npm test
# Or use watch mode
npm test -- --watch
```

3. **Monitor coverage:**

```bash
npm test -- --coverage
# Aim for >80% coverage
```

If you continue to experience issues, please open an issue on the [GitHub repository](https://github.com/your-org/mcp-tdd) with the debug information collected using the script above.

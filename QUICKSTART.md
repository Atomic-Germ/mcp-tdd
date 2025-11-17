# MCP TDD Quickstart Guide

This guide will help you get started with the MCP TDD server in under 5 minutes.

## Installation

```bash
cd mcp-tdd
npm install
npm run build
```

## Configuration

Add to your MCP client configuration (e.g., `~/.config/claude/mcp.json`):

```json
{
  "mcpServers": {
    "tdd": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-tdd/dist/index.js"],
      "env": {}
    }
  }
}
```

## Basic TDD Workflow

### 1. Initialize a Cycle

```
Use tool: tdd_init_cycle

Parameters:
- feature: "calculator-add"
- description: "Add addition functionality to calculator"
- testFramework: "vitest"
- language: "typescript"
```

### 2. Write a Failing Test (RED)

```
Use tool: tdd_write_test

Parameters:
- testFile: "test/calculator.test.ts"
- testName: "should add two numbers"
- testCode: |
  import { describe, it, expect } from 'vitest';
  import { add } from '../src/calculator';

  describe('Calculator', () => {
    it('should add two numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
  });
- expectedToFail: true
```

### 3. Run Tests (Verify RED)

```
Use tool: tdd_run_tests

Parameters:
- expectation: "fail"
```

### 4. Implement (GREEN)

```
Use tool: tdd_implement

Parameters:
- file: "src/calculator.ts"
- code: |
  export function add(a: number, b: number): number {
    return a + b;
  }
```

### 5. Run Tests Again (Verify GREEN)

```
Use tool: tdd_run_tests

Parameters:
- expectation: "pass"
```

### 6. Complete Cycle

```
Use tool: tdd_complete_cycle

Parameters:
- notes: "Successfully added addition functionality"
```

## Verification

```bash
# Run the tests manually to verify
npm test
```

## Next Steps

- Check out the full README.md for advanced features
- Explore checkpoint/rollback functionality
- Try the refactor phase for code improvements

## Troubleshooting

### Tests not running?

Make sure you have a test framework installed:

```bash
npm install -D vitest  # or jest, mocha
```

### Build errors?

Clean and rebuild:

```bash
npm run clean
npm install
npm run build
```

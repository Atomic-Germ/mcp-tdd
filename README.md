# MCP TDD Server

> A comprehensive MCP server for structured Test-Driven Development workflows and AI-guided TDD practices

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)
[![CI/CD](https://github.com/Atomic-Germ/mcp-tdd/actions/workflows/ci.yml/badge.svg)](https://github.com/Atomic-Germ/mcp-tdd/actions/workflows/ci.yml)

## Overview

MCP TDD is a Model Context Protocol server that provides structured tools and workflows for robust Test-Driven Development. It guides AI reasoning models through the classic Red-Green-Refactor TDD cycle with clarity, precision, and built-in state management.

### Key Features

- 🔴 **RED Phase** - Write failing tests that define desired functionality
- 🟢 **GREEN Phase** - Implement minimal code to make tests pass
- 🔄 **REFACTOR Phase** - Improve code quality while maintaining passing tests
- 📊 **State Management** - Track TDD cycle progress and history
- ✅ **Multi-Framework** - Support for Jest, Vitest, and Mocha
- 💾 **Checkpoint System** - Save and rollback to previous states
- 📈 **Coverage Analysis** - Monitor test coverage metrics
- 🎯 **Guided Workflows** - Step-by-step TDD guidance for AI agents

## Installation

```bash
# Clone the repository
git clone https://github.com/Atomic-Germ/mcp-tdd.git
cd mcp-tdd

# Install dependencies
npm install

# Build the project
npm run build
```

## Quick Start

### As an MCP Server

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "tdd": {
      "command": "node",
      "args": ["/path/to/mcp-tdd/dist/index.js"],
      "env": {}
    }
  }
}
```

### Basic TDD Workflow

```bash
# Initialize a new TDD cycle
tdd_init_cycle --feature "calculator" --description "Basic calculator operations"

# Write a failing test (RED)
tdd_write_test --file "test/calculator.test.ts" --test "should add two numbers"

# Run tests (should fail)
tdd_run_tests --expectation "fail"

# Implement code (GREEN)
tdd_implement --file "src/calculator.ts" --code "export const add = (a, b) => a + b"

# Run tests (should pass)
tdd_run_tests --expectation "pass"

# Refactor if needed
tdd_refactor --file "src/calculator.ts" --rationale "Add type safety"
```

## Core TDD Methodology

The server implements the classic TDD cycle:

1. **RED** - Write a failing test that defines desired functionality
2. **GREEN** - Implement minimal code to make the test pass
3. **REFACTOR** - Improve code quality while maintaining passing tests

## Usage Examples

### Initialize a TDD Cycle

```typescript
// Request via MCP
{
  "tool": "tdd_init_cycle",
  "arguments": {
    "feature": "user-authentication",
    "description": "Implement user login and registration system",
    "testFramework": "vitest",
    "language": "typescript"
  }
}
```

### Write a Failing Test (RED Phase)

```typescript
{
  "tool": "tdd_write_test",
  "arguments": {
    "testFile": "test/auth.test.ts",
    "testName": "should authenticate user with valid credentials",
    "testCode": "expect(authenticate('user', 'pass')).toBe(true)",
    "expectedToFail": true
  }
}
```

### Implement Code (GREEN Phase)

```typescript
{
  "tool": "tdd_implement",
  "arguments": {
    "file": "src/auth.ts",
    "code": "export const authenticate = (user: string, pass: string) => user === 'user' && pass === 'pass'"
  }
}
```

### Refactor Code (REFACTOR Phase)

```typescript
{
  "tool": "tdd_refactor",
  "arguments": {
    "file": "src/auth.ts",
    "code": "// Improved implementation with proper validation",
    "rationale": "Add input validation and security improvements"
  }
}
```

## Tool Reference

### Essential TDD Tools

#### tdd_init_cycle

Initialize a new TDD cycle for a feature or bug fix.

**Parameters:**

- `feature` (required): Feature name or identifier
- `description` (required): Detailed description
- `testFramework` (optional): `jest`, `vitest`, or `mocha` (default: `vitest`)
- `language` (optional): `typescript` or `javascript` (default: `typescript`)

#### tdd_write_test

Write or update test cases (RED phase).

**Parameters:**

- `testFile` (required): Path to the test file
- `testName` (required): Name of the test case
- `testCode` (required): Test code to write
- `expectedToFail` (optional): Whether test should fail initially (default: `true`)

#### tdd_run_tests

Execute tests and report results.

**Parameters:**

- `testPattern` (optional): Pattern to match test files
- `expectation` (optional): `pass` or `fail` - expected test outcome

#### tdd_implement

Implement code to make tests pass (GREEN phase).

**Parameters:**

- `file` (required): Path to implementation file
- `code` (required): Implementation code

#### tdd_refactor

Refactor code while maintaining tests (REFACTOR phase).

**Parameters:**

- `file` (required): Path to file to refactor
- `code` (required): Refactored code
- `rationale` (optional): Reason for refactoring

#### tdd_status

Get current TDD cycle status and recommended next action.

**Parameters:** None

#### tdd_complete_cycle

Mark TDD cycle as complete and generate summary.

**Parameters:**

- `notes` (optional): Completion notes

### Advanced Features

#### tdd_checkpoint

Save current state for potential rollback.

**Parameters:**

- `description` (required): Checkpoint description

#### tdd_rollback

Rollback to a previous checkpoint.

**Parameters:**

- `checkpointId` (required): ID of checkpoint to rollback to

#### tdd_coverage

Analyze test coverage metrics.

**Parameters:**

- `path` (optional): Path to analyze coverage for

## Development

### Project Structure

```
mcp-tdd/
├── src/
│   ├── index.ts              # Main entry point
│   ├── server.ts             # TDD server implementation
│   ├── types/
│   │   └── index.ts          # Type definitions
│   ├── config/
│   │   └── index.ts          # Configuration management
│   ├── services/
│   │   ├── TDDStateManager.ts # State management
│   │   └── TestRunner.ts      # Test execution
│   ├── handlers/
│   │   └── TDDToolHandlers.ts # Tool request handlers
│   └── utils/
│       └── fileUtils.ts       # File utilities
└── test/                     # Test suites
    ├── TDDStateManager.test.ts
    ├── TDDServer.test.ts
    └── ConfigManager.test.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Type checking
npm run typecheck
```

### Building

```bash
# Development build
npm run build

# Watch mode
npm run build:watch

# Clean build
npm run clean && npm run build
```

## Integration with Other MCP Tools

MCP TDD works seamlessly with other MCP servers:

- **mcp-consult** - Get AI consultation on test strategies and implementation approaches
- **mcp-optimist** - Code optimization and refactoring guidance during REFACTOR phase
- **Testing Frameworks** - Direct integration with Jest, Vitest, and Mocha
- **Code Coverage Tools** - Built-in coverage analysis and reporting
- **CI/CD Systems** - Integrate TDD workflows into automated pipelines

## Supported Test Frameworks

- **Vitest** (default) - Fast, modern test framework with great TypeScript support
- **Jest** - Popular, mature testing framework with extensive ecosystem
- **Mocha** - Flexible test framework with customizable assertion libraries

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Development Guidelines

- Follow Test-Driven Development practices (dogfooding our own tool!)
- Maintain high test coverage (>90%)
- Use TypeScript strict mode
- Document all public APIs
- Write clear, descriptive commit messages

## Architecture

For detailed technical architecture and design decisions, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Requirements

- Node.js 18+
- npm or pnpm for package management
- One of: Jest, Vitest, or Mocha (for test execution)

## Support

- 📚 [Documentation Index](./DOCUMENTATION_INDEX.md)
- 🚀 [Quick Start Guide](./QUICKSTART.md)
- 🏗️ [Architecture Guide](./ARCHITECTURE.md)
- 🐛 [Issue Tracker](https://github.com/Atomic-Germ/mcp-tdd/issues)
- 💬 [Discussions](https://github.com/Atomic-Germ/mcp-tdd/discussions)

## Links

- [Model Context Protocol Specification](https://modelcontextprotocol.io/docs)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Test-Driven Development Guide](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Built with ❤️ using Test-Driven Development and the Model Context Protocol**

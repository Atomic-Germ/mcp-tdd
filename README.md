# MCP TDD Server

> A Model Context Protocol server for structured Test-Driven Development workflows

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

## Overview

MCP TDD is a Model Context Protocol server that provides structured tools and workflows for robust Test-Driven Development. It guides AI reasoning models through the classic Red-Green-Refactor TDD cycle with clarity and precision.

## Core TDD Methodology

The server implements the classic TDD cycle:

1. **RED** - Write a failing test that defines desired functionality
2. **GREEN** - Implement minimal code to make the test pass
3. **REFACTOR** - Improve code quality while maintaining passing tests

## Features

### Essential TDD Tools

- **tdd_init_cycle** - Initialize a new TDD cycle for a feature or bug fix
- **tdd_write_test** - Create or update test cases (RED phase)
- **tdd_run_tests** - Execute tests and report results
- **tdd_implement** - Write implementation code (GREEN phase)
- **tdd_refactor** - Improve code while maintaining tests (REFACTOR phase)
- **tdd_status** - Get current TDD cycle status and next recommended action
- **tdd_complete_cycle** - Mark cycle complete and generate summary

### Advanced Features

- **tdd_checkpoint** - Save current state for rollback capability
- **tdd_rollback** - Return to previous checkpoint
- **tdd_coverage** - Analyze test coverage metrics

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
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

## Tool Reference

### tdd_init_cycle

Initialize a new TDD cycle.

**Parameters:**

- `feature` (required): Feature name or identifier
- `description` (required): Detailed description
- `testFramework` (optional): `jest`, `vitest`, or `mocha` (default: `vitest`)
- `language` (optional): `typescript` or `javascript` (default: `typescript`)

### tdd_write_test

Write or update a test case (RED phase).

**Parameters:**

- `testFile` (required): Path to the test file
- `testName` (required): Name of the test case
- `testCode` (required): Test code to write
- `expectedToFail` (optional): Whether test should fail initially (default: `true`)

### tdd_run_tests

Execute tests and report results.

**Parameters:**

- `testPattern` (optional): Pattern to match test files
- `expectation` (optional): `pass` or `fail` - expected test outcome

### tdd_implement

Implement code to make tests pass (GREEN phase).

**Parameters:**

- `file` (required): Path to implementation file
- `code` (required): Implementation code

### tdd_refactor

Refactor code while maintaining tests (REFACTOR phase).

**Parameters:**

- `file` (required): Path to file to refactor
- `code` (required): Refactored code
- `rationale` (optional): Reason for refactoring

### tdd_status

Get current TDD cycle status and recommended next action.

**Parameters:** None

### tdd_complete_cycle

Mark TDD cycle as complete and generate summary.

**Parameters:**

- `notes` (optional): Completion notes

### tdd_checkpoint

Save current state for potential rollback.

**Parameters:**

- `description` (required): Checkpoint description

### tdd_rollback

Rollback to a previous checkpoint.

**Parameters:**

- `checkpointId` (required): ID of checkpoint to rollback to

## Architecture

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
└── test/
    ├── TDDStateManager.test.ts
    ├── TDDServer.test.ts
    └── ConfigManager.test.ts
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run build:watch

# Run tests
npm test

# Watch tests
npm run test:watch

# Coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

## Supported Test Frameworks

- **Vitest** (default) - Fast, modern test framework
- **Jest** - Popular testing framework
- **Mocha** - Flexible test framework

## License

MIT

## Requirements

- Node.js 18+
- npm or pnpm

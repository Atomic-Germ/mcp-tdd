# MCP TDD Architecture

## Overview

MCP TDD is built following clean architecture principles with clear separation of concerns.

## Project Structure

```
mcp-tdd/
├── src/
│   ├── index.ts                    # Entry point & MCP server setup
│   ├── server.ts                   # TDD server class & tool definitions
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── config/
│   │   └── index.ts               # Configuration management
│   ├── services/
│   │   ├── TDDStateManager.ts     # TDD cycle state management
│   │   └── TestRunner.ts          # Test execution service
│   ├── handlers/
│   │   └── TDDToolHandlers.ts     # Tool request handlers
│   └── utils/
│       └── fileUtils.ts           # File I/O utilities
└── test/
    ├── TDDStateManager.test.ts    # State manager tests
    ├── TDDServer.test.ts          # Server tests
    └── ConfigManager.test.ts      # Config tests
```

## Core Components

### 1. TDDServer (server.ts)

The main server class that:

- Defines all available MCP tools
- Manages server metadata (name, version)
- Provides tool schemas for MCP clients

### 2. TDDStateManager (services/TDDStateManager.ts)

Manages TDD cycle state including:

- Cycle initialization and lifecycle
- Test case tracking
- Phase transitions (red → green → refactor)
- Checkpoint creation and rollback
- Cycle history

**Key Methods:**

- `initCycle()` - Start a new TDD cycle
- `addTest()` - Add a test case
- `advancePhase()` - Move to next phase
- `createCheckpoint()` - Save current state
- `rollbackToCheckpoint()` - Restore previous state
- `completeCycle()` - Finalize and archive cycle

### 3. TestRunner (services/TestRunner.ts)

Executes tests using various frameworks:

- Runs tests via child processes
- Parses test output for results
- Supports multiple test frameworks (Vitest, Jest, Mocha)
- Handles expected failures (RED phase)

### 4. TDDToolHandlers (handlers/TDDToolHandlers.ts)

Implements the business logic for each tool:

- Validates tool inputs
- Orchestrates state changes
- Executes file operations
- Provides guidance for next steps

### 5. ConfigManager (config/index.ts)

Manages configuration:

- Default settings
- User-provided overrides
- Test framework selection
- Language preferences

## Data Flow

```
MCP Client
    ↓
index.ts (MCP Server)
    ↓
TDDToolHandlers
    ↓
┌─────────────┬──────────────┐
│             │              │
TDDStateManager  TestRunner  FileUtils
```

## TDD Cycle State Machine

```
[INIT] → [RED] → [GREEN] → [REFACTOR] → [COMPLETE]
           ↑        ↑           ↑
           └────────┴───────────┘
              (via checkpoint rollback)
```

## Type System

### Core Types

- **TDDCycle**: Complete cycle state
- **TestCase**: Individual test metadata
- **Checkpoint**: Saved state snapshot
- **TestResult**: Test execution results
- **Tool**: MCP tool definition

## Design Principles

1. **Single Responsibility**: Each class has one clear purpose
2. **Dependency Injection**: Services are injected into handlers
3. **Type Safety**: Comprehensive TypeScript types
4. **Testability**: All components are unit tested
5. **Immutability**: State changes are explicit and tracked

## Extension Points

### Adding a New Tool

1. Add tool definition in `server.ts` → `listTools()`
2. Add handler method in `TDDToolHandlers.ts`
3. Add case in `index.ts` → `CallToolRequestSchema` handler
4. Write tests in `test/`

### Adding a Test Framework

1. Add framework type to `TDDConfig`
2. Implement test command in `TestRunner.buildTestCommand()`
3. Implement output parser in `TestRunner.parseTestOutput()`

## Dependencies

### Production

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `zod` - Runtime type validation

### Development

- `vitest` - Test framework
- `typescript` - Type system
- `eslint` - Code linting
- `prettier` - Code formatting

## Testing Strategy

- **Unit Tests**: Each service/component tested in isolation
- **Integration Tests**: Tool handlers tested with real services
- **Test Coverage**: Aim for >80% coverage

## Performance Considerations

- State is stored in-memory (no persistence)
- Test execution runs in child processes
- File operations are async
- JSON serialization for responses

## Security

- No external network calls
- File operations limited to project directory
- Test execution via npm scripts (user's environment)
- No credential storage

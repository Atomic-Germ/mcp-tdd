# MCP TDD Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         MCP Client                          │
│                    (Claude, AI Agent, etc.)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ MCP Protocol (stdio)
┌────────────────────────▼────────────────────────────────────┐
│                      MCP TDD Server                         │
│                      (index.ts)                             │
├─────────────────────────────────────────────────────────────┤
│  Tool Handlers (tddHandlers.ts)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ tdd_init_cycle      tdd_write_test                   │  │
│  │ tdd_run_tests       tdd_implement                    │  │
│  │ tdd_refactor        tdd_status                       │  │
│  │ tdd_complete_cycle  tdd_checkpoint                   │  │
│  │ tdd_rollback        tdd_coverage                     │  │
│  │ tdd_consult         tdd_compare_approaches           │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  State Management (tddState.ts)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Active Cycle   Tests   Implementations               │  │
│  │ Refactorings   Checkpoints   Configuration           │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Utilities (tddUtils.ts)                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ runTests()   validatePhaseTransition()               │  │
│  │ File I/O     Coverage Parsing                        │  │
│  │ Checkpoint Management   Test Output Parsing          │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Type System (tddTypes.ts)                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ TDDCycle   TDDTest   Implementation   Refactoring    │  │
│  │ Checkpoint   Status   Coverage   Config              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
     ┌───────────▼──────────┐  ┌─────────▼──────────────┐
     │  Test Frameworks     │  │  Ollama (Optional)     │
     │  Jest/Vitest/Mocha   │  │  mcp-consult           │
     └──────────────────────┘  └────────────────────────┘
```

## Data Flow

### TDD Cycle Lifecycle

```
┌─────────────┐
│   READY     │ ◄── tdd_init_cycle()
└──────┬──────┘
       │ tdd_write_test()
       ▼
┌─────────────┐
│    RED      │ ◄── Tests written (failing)
└──────┬──────┘
       │ tdd_run_tests(expectation: "fail")
       │ tdd_implement()
       ▼
┌─────────────┐
│   GREEN     │ ◄── Tests passing
└──────┬──────┘
       │ tdd_run_tests(expectation: "pass")
       │ tdd_refactor() (optional)
       ▼
┌─────────────┐
│  REFACTOR   │ ◄── Code improved, tests still pass
└──────┬──────┘
       │ tdd_complete_cycle()
       ▼
┌─────────────┐
│  COMPLETE   │
└─────────────┘
```

## Module Responsibilities

### index.ts
**Role**: MCP Server Entry Point
- Initialize MCP server
- Register request handlers
- Initialize TDD state on startup
- Handle stdio transport

**Dependencies**: 
- `@modelcontextprotocol/sdk`
- `tddHandlers`
- `tddState`

### tddHandlers.ts
**Role**: Tool Implementation
- Implement all 12 TDD tools
- Validate tool arguments
- Call appropriate utilities
- Format responses for MCP client
- Handle errors gracefully

**Key Functions**:
- `listTDDTools()`: Return tool schemas
- `handleTDDTool()`: Route tool calls
- Individual handlers for each tool

**Dependencies**:
- `tddState` (state management)
- `tddUtils` (operations)
- `tddTypes` (types)
- `axios` (Ollama integration)

### tddState.ts
**Role**: State Persistence & Management
- Maintain active TDD cycle
- Track all tests, implementations, refactorings
- Store checkpoints
- Persist to disk
- Provide CRUD operations

**Key Functions**:
- `initializeState()`: Load from disk
- `saveState()`: Persist to disk
- `getActiveCycle()`: Get current cycle
- `setActiveCycle()`: Set current cycle
- `updateCycle()`: Modify cycle
- `addTest()`, `addImplementation()`, etc.

**Storage**: JSON file in `TDD_STATE_DIR`

### tddUtils.ts
**Role**: Core TDD Operations
- Execute tests across frameworks
- Parse test output
- Validate phase transitions
- Provide next action guidance
- Manage files and checkpoints

**Key Functions**:
- `runTests()`: Execute test suite
- `parseTestOutput()`: Extract results
- `parseCoverageReport()`: Parse coverage
- `validatePhaseTransition()`: Enforce rules
- `determineNextAction()`: AI guidance
- `createCheckpointSnapshot()`: Save state
- `restoreCheckpointSnapshot()`: Restore state

**Framework Support**:
- Jest
- Vitest
- Mocha
- Extensible

### tddTypes.ts
**Role**: Type Definitions
- Define all TDD-related types
- Ensure type safety
- Document data structures
- Enable IDE autocomplete

**Key Types**:
- `TDDCycle`: Complete cycle state
- `TDDTest`: Test definition
- `TestRunResult`: Test execution results
- `Implementation`: Code implementation
- `Refactoring`: Refactoring operation
- `Checkpoint`: State snapshot
- `TDDStatus`: Current status
- `TDDConfig`: Configuration

## State Management

### Persistence Model

```
/tmp/mcp-tdd-state/ (or TDD_STATE_DIR)
└── tdd-state.json
    ├── activeCycle: TDDCycle | undefined
    ├── cycles: Record<string, TDDCycle>
    ├── tests: Record<string, TDDTest>
    ├── implementations: Record<string, Implementation>
    ├── refactorings: Record<string, Refactoring>
    ├── checkpoints: Record<string, Checkpoint>
    └── config: TDDConfig
```

### State Updates

1. **Cycle Operations**: Update in-memory, then save
2. **Test Operations**: Add to tests map, update cycle
3. **Implementation**: Add to implementations, update cycle
4. **Checkpoint**: Snapshot files, save to checkpoints map
5. **Rollback**: Restore files from checkpoint

## Tool Interaction Patterns

### Standard Tool Flow
```
1. Client calls tool via MCP
2. Server routes to handleTDDTool()
3. Handler validates arguments
4. Handler checks state/permissions
5. Handler performs operation
6. Handler updates state
7. Handler saves state to disk
8. Handler returns formatted response
```

### State-Dependent Tools

**Require Active Cycle**:
- tdd_write_test
- tdd_implement
- tdd_refactor
- tdd_complete_cycle

**Work Without Cycle**:
- tdd_init_cycle
- tdd_status (warns if no cycle)
- tdd_run_tests (warns if no cycle)
- tdd_coverage
- tdd_compare_approaches

## Phase Validation

### Strict Mode Rules

```typescript
READY → RED: Always allowed (write tests)
RED → GREEN: Requires failing tests
GREEN → REFACTOR: Requires passing tests
REFACTOR → COMPLETE: Requires passing tests
* → COMPLETE: Requires passing tests + at least 1 test
```

### Non-Strict Mode
All transitions allowed (for flexibility)

## Test Framework Integration

### Adapter Pattern

```typescript
interface TestFrameworkAdapter {
  runTests(pattern?: string): Promise<TestRunResult>
  parseCoverage(): Promise<CoverageReport>
}
```

### Current Adapters
- Jest (default)
- Vitest
- Mocha

### Extension Point
Add new framework in `runTests()` switch statement

## External Integrations

### Ollama (Optional)
- Used by `tdd_consult` tool
- Provides design guidance
- Context-aware prompts
- Graceful degradation if unavailable

### mcp-consult (Optional)
- Can be called via `tdd_consult`
- Provides alternative reasoning
- Useful for complex decisions

### Test Frameworks (Required)
- Must have test framework installed
- Framework specified in config or env var

## Error Handling Strategy

### Levels
1. **Validation Errors**: Bad arguments, missing required fields
2. **State Errors**: No active cycle, invalid phase transition
3. **Operation Errors**: Test execution failed, file I/O error
4. **External Errors**: Ollama unavailable, framework missing

### Response Format
```typescript
{
  content: [{
    type: "text",
    text: "Error message with context and guidance"
  }],
  isError: true
}
```

### Recovery
- Clear error messages
- Suggest corrective actions
- Allow retry
- Preserve state when possible

## Configuration Hierarchy

```
1. Environment Variables (highest priority)
   ├── TEST_FRAMEWORK
   ├── MIN_COVERAGE
   ├── TDD_STRICT_MODE
   ├── OLLAMA_BASE_URL
   └── TDD_STATE_DIR

2. .tddrc.json (project-specific)
   └── All config options

3. Defaults (lowest priority)
   └── Built-in sensible defaults
```

## Performance Considerations

### State Management
- In-memory cache
- Disk writes on changes
- Async I/O operations

### Test Execution
- Configurable timeouts (default: 5 minutes)
- Stream processing for large outputs
- JSON parsing for structured results

### Checkpoints
- On-demand snapshots
- Lazy loading
- Cleanup old checkpoints (manual)

## Security Considerations

### File System
- Respect process permissions
- Sandbox within project directory
- Validate file paths

### External Processes
- Test framework execution via child_process
- Timeout protection
- Output sanitization

### State Persistence
- JSON format (human readable)
- No sensitive data storage
- User-specified directories

## Extensibility Points

### Add New Tools
1. Define in `listTDDTools()`
2. Add handler in `handleTDDTool()`
3. Implement logic
4. Update types if needed

### Add Test Framework
1. Add case in `runTests()`
2. Implement output parser
3. Document in README

### Add Integration
1. Create new handler function
2. Add optional dependency check
3. Provide fallback behavior

## Debugging

### Logging
- Console.error for server logs
- Structured log messages
- State dumps available

### State Inspection
```bash
cat /tmp/mcp-tdd-state/tdd-state.json | jq
```

### Demo Mode
```bash
npm run demo:tdd
```

## Testing Strategy

### Unit Tests
- Test individual utilities
- Mock external dependencies
- Test state management

### Integration Tests
- Test full tool workflows
- Test phase transitions
- Test error handling

### Demo Tests
- Manual verification via demo
- End-to-end workflow validation

## Deployment

### As MCP Server
```json
{
  "mcpServers": {
    "tdd": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    }
  }
}
```

### Standalone
```bash
node dist/index.js
```

### Development
```bash
ts-node src/index.ts
```

## Monitoring & Observability

### Health Indicators
- Server startup success
- State initialization
- Tool execution counts
- Error rates

### Logs
- Server lifecycle events
- Tool invocations
- State changes
- Errors and warnings

### Metrics (Future)
- Cycles completed
- Tests written/passing
- Coverage trends
- Tool usage patterns

---

**Architecture Version**: 1.0.0
**Last Updated**: 2024-11-16
**Status**: Production Ready ✅

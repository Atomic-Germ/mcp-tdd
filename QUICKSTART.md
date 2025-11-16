# MCP TDD Quick Start Guide

This guide will help you get started with the MCP TDD server in minutes.

## Installation

```bash
# Clone or navigate to the repository
cd mcp-tdd

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Quick Demo

Run the included demo to see TDD workflow in action:

```bash
npm run demo:tdd
```

This demo will show:
1. Initializing a TDD cycle
2. Writing failing tests (RED)
3. Implementing minimal code (GREEN)
4. Creating checkpoints
5. Completing the cycle

## Basic Usage

### 1. Start the Server

```bash
npm start
```

The server runs over stdio and can be connected to via any MCP client.

### 2. Connect with an MCP Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/index.js"]
});

const client = new Client({ name: "my-tdd-client", version: "1.0.0" });
await client.connect(transport);
```

### 3. Use TDD Tools

#### Initialize a Cycle

```typescript
await client.callTool({
  name: "tdd_init_cycle",
  arguments: {
    feature: "user-authentication",
    description: "Add JWT-based user authentication",
    testFramework: "jest",
    language: "typescript"
  }
});
```

#### Write a Test (RED)

```typescript
await client.callTool({
  name: "tdd_write_test",
  arguments: {
    testFile: "src/auth/login.test.ts",
    testName: "should authenticate valid credentials",
    testCode: "test('should authenticate', () => { ... })",
    expectedToFail: true
  }
});
```

#### Run Tests

```typescript
await client.callTool({
  name: "tdd_run_tests",
  arguments: {
    expectation: "fail" // or "pass"
  }
});
```

#### Implement Code (GREEN)

```typescript
await client.callTool({
  name: "tdd_implement",
  arguments: {
    implementationFile: "src/auth/login.ts",
    code: "export function login(...) { ... }",
    testsCovered: ["should authenticate valid credentials"]
  }
});
```

#### Check Status

```typescript
await client.callTool({
  name: "tdd_status",
  arguments: {}
});
```

#### Complete Cycle

```typescript
await client.callTool({
  name: "tdd_complete_cycle",
  arguments: {
    summary: "Implemented user authentication",
    testsAdded: 5,
    testsPassing: 5
  }
});
```

## Configuration

### Environment Variables

```bash
# Test framework (default: jest)
export TEST_FRAMEWORK=jest

# Minimum coverage threshold (default: 80)
export MIN_COVERAGE=85

# Strict mode enforcement (default: true)
export TDD_STRICT_MODE=true

# Ollama endpoint for tdd_consult (default: http://localhost:11434)
export OLLAMA_BASE_URL=http://localhost:11434

# State directory (default: /tmp/mcp-tdd-state)
export TDD_STATE_DIR=/path/to/state

# Checkpoint directory (default: .tdd-checkpoints)
export CHECKPOINT_DIR=.checkpoints
```

### Configuration File

Create `.tddrc.json` in your project root:

```json
{
  "testFramework": "jest",
  "language": "typescript",
  "coverageThreshold": 85,
  "strictMode": true,
  "autoRunTests": true,
  "checkpointOnPhase": ["GREEN"],
  "consultOnComplexity": true,
  "testPatterns": {
    "unit": "**/*.test.ts",
    "integration": "**/*.integration.ts",
    "e2e": "**/*.e2e.ts"
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `tdd_init_cycle` | Start a new TDD cycle |
| `tdd_write_test` | Write test cases (RED phase) |
| `tdd_run_tests` | Execute tests and validate phase |
| `tdd_implement` | Write implementation (GREEN phase) |
| `tdd_refactor` | Refactor code safely (REFACTOR phase) |
| `tdd_status` | Get current cycle status |
| `tdd_complete_cycle` | Finalize cycle |
| `tdd_consult` | Consult Ollama for design decisions |
| `tdd_checkpoint` | Save current state |
| `tdd_rollback` | Restore to checkpoint |
| `tdd_coverage` | Analyze test coverage |
| `tdd_compare_approaches` | Compare implementation strategies |

## TDD Workflow Example

```
1. tdd_init_cycle({ feature: "email-validation" })
   → Phase: READY

2. tdd_write_test({ test for valid emails, expectedToFail: true })
   → Phase: RED

3. tdd_run_tests({ expectation: "fail" })
   → Confirms RED phase

4. tdd_implement({ email validation function })
   → Phase: GREEN

5. tdd_run_tests({ expectation: "pass" })
   → Confirms GREEN phase

6. tdd_refactor({ improve regex pattern })
   → Phase: REFACTOR

7. tdd_run_tests({ expectation: "pass" })
   → Tests still pass after refactoring

8. tdd_complete_cycle({ summary: "Email validation complete" })
   → Cycle complete, ready for next feature
```

## Best Practices

### 1. Always Check Status

Call `tdd_status` frequently to understand where you are in the cycle.

### 2. Follow the Phases

- **RED**: Write failing tests first
- **GREEN**: Minimal implementation to pass tests
- **REFACTOR**: Improve code while tests pass

### 3. Use Checkpoints

Create checkpoints before risky changes:

```typescript
await client.callTool({
  name: "tdd_checkpoint",
  arguments: {
    checkpointName: "before-refactoring",
    reason: "Safe point before major refactor"
  }
});
```

### 4. Consult When Stuck

Use `tdd_consult` for complex decisions (requires Ollama):

```typescript
await client.callTool({
  name: "tdd_consult",
  arguments: {
    question: "Should I use factory pattern or dependency injection?",
    context: {
      phase: "RED",
      language: "typescript"
    }
  }
});
```

### 5. Small Iterations

Keep cycles small and focused. Complete one feature before starting another.

## Troubleshooting

### Tests Not Running

Make sure your test framework is installed:

```bash
npm install --save-dev jest
# or
npm install --save-dev vitest
```

### Strict Mode Errors

If strict mode is preventing progress, disable temporarily:

```bash
export TDD_STRICT_MODE=false
```

### Ollama Consultation Fails

The `tdd_consult` tool requires Ollama running locally:

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Or specify different endpoint
export OLLAMA_BASE_URL=http://your-ollama-server:11434
```

### State Issues

Reset TDD state:

```bash
rm -rf /tmp/mcp-tdd-state
# or your custom state directory
```

## Integration with Claude or other AI

When using with Claude Desktop or other MCP clients, add to your configuration:

```json
{
  "mcpServers": {
    "tdd": {
      "command": "node",
      "args": ["/path/to/mcp-tdd/dist/index.js"]
    }
  }
}
```

Then use natural language:

> "Start a TDD cycle for password validation"
> 
> "Write tests for valid password requirements"
> 
> "Implement the password validator"
> 
> "Check TDD status"

## Next Steps

- Read the full [README.md](README.md) for detailed tool descriptions
- Explore [examples](examples/) for real-world TDD workflows
- Check [tests](test/) for usage patterns
- Try the demo: `npm run demo:tdd`

## Support

For issues or questions:
- Check the README.md
- Review the demo code in `src/tdd-demo.ts`
- Open an issue on GitHub

Happy test-driven development! 🧪✅

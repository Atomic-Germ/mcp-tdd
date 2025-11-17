# MCP TDD Server - Quick Start Guide

Get structured Test-Driven Development workflows running in under 5 minutes!

## Prerequisites

- Node.js 18+
- npm or pnpm
- An MCP-compatible client (e.g., Claude Desktop)
- A test framework (Vitest, Jest, or Mocha)

## 1. Installation

```bash
# Clone and setup
git clone https://github.com/Atomic-Germ/mcp-tdd.git
cd mcp-tdd
npm install
npm run build
```

## 2. Configure MCP Client

### Claude Desktop

Edit your configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

Add the server:

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

### Other MCP Clients

Use these connection details:

- **Command**: `node`
- **Args**: `["/path/to/mcp-tdd/dist/index.js"]`
- **Protocol**: stdio

## 3. Verify Setup

1. Restart your MCP client
2. Look for "tdd" in available tools
3. You should see 9 TDD workflow tools available

## 4. First TDD Cycle

Follow the Red-Green-Refactor cycle:

### Step 1: Initialize (🚀)

```
Use tool: tdd_init_cycle

Parameters:
- feature: "calculator-add"
- description: "Add addition functionality to calculator"
- testFramework: "vitest"
- language: "typescript"
```

### Step 2: Write Failing Test - RED (🔴)

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

### Step 3: Verify Test Fails (🔴)

```
Use tool: tdd_run_tests

Parameters:
- expectation: "fail"
```

### Step 4: Implement Code - GREEN (🟢)

```
Use tool: tdd_implement

Parameters:
- file: "src/calculator.ts"
- code: |
  export function add(a: number, b: number): number {
    return a + b;
  }
```

### Step 5: Verify Test Passes (🟢)

```
Use tool: tdd_run_tests

Parameters:
- expectation: "pass"
```

### Step 6: Complete Cycle (✅)

```
Use tool: tdd_complete_cycle

Parameters:
- notes: "Successfully implemented addition functionality using TDD"
```

## 5. Verify Everything Works

✅ **Cycle Initialized**: TDD cycle starts properly  
✅ **Tests Run**: Test framework executes correctly  
✅ **RED Phase**: Failing tests are detected  
✅ **GREEN Phase**: Implementation makes tests pass  
✅ **State Tracking**: TDD cycle state is maintained

## Available Tools

| Tool                 | Phase    | Purpose                   |
| -------------------- | -------- | ------------------------- |
| `tdd_init_cycle`     | Start    | Initialize new TDD cycle  |
| `tdd_write_test`     | RED      | Write failing tests       |
| `tdd_run_tests`      | All      | Execute tests             |
| `tdd_implement`      | GREEN    | Write implementation code |
| `tdd_refactor`       | REFACTOR | Improve code quality      |
| `tdd_status`         | All      | Check cycle status        |
| `tdd_complete_cycle` | End      | Finalize cycle            |
| `tdd_checkpoint`     | All      | Save current state        |
| `tdd_rollback`       | All      | Restore previous state    |

## Common Issues

### Tests not running

Make sure you have a test framework:

```bash
npm install -D vitest  # or jest, mocha
```

### Build errors

```bash
npm run clean
npm install
npm run build
```

### MCP client can't find tools

- Check the absolute path in configuration
- Restart your MCP client after config changes
- Verify build succeeded: `ls -la dist/`

## Configuration

### Test Framework Selection

Set your preferred framework during cycle initialization:

```json
{
  "testFramework": "vitest", // or "jest", "mocha"
  "language": "typescript" // or "javascript"
}
```

### Project Setup

Ensure your project has the proper structure:

```
your-project/
├── src/           # Implementation code
├── test/          # Test files
├── package.json   # Dependencies
└── tsconfig.json  # TypeScript config (if using TS)
```

## Advanced Features

### Checkpoints & Rollback

```
# Save current state
Use: tdd_checkpoint
Parameters: { description: "Working addition feature" }

# Rollback if needed
Use: tdd_rollback
Parameters: { checkpointId: "checkpoint-id" }
```

### Test Coverage

```
Use: tdd_coverage
Parameters: { path: "./src" }
```

### Refactoring Phase

```
Use: tdd_refactor
Parameters:
- file: "src/calculator.ts"
- code: "// Improved implementation"
- rationale: "Better error handling and type safety"
```

## Next Steps

- 📖 **Full Documentation**: See [README.md](./README.md)
- 🏗️ **Architecture**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- 📋 **Workflows**: Check [WORKFLOWS.md](./WORKFLOWS.md)
- 🤝 **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Integration with Other Tools

TDD works great with:

- **mcp-consult** - Get AI guidance on test strategies
- **mcp-optimist** - Optimize code during refactor phase
- **Your IDE** - Use TDD tools within your development environment

---

**🎉 You're ready to practice Test-Driven Development with AI assistance!**

Need help? Check our [documentation index](./DOCUMENTATION_INDEX.md) or [open an issue](https://github.com/Atomic-Germ/mcp-tdd/issues).

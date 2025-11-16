# MCP TDD (Test-Driven Development) Server

A comprehensive MCP (Model Context Protocol) server that provides structured tools and workflows for robust Test-Driven Development. This server guides AI reasoning models through the classic Red-Green-Refactor TDD cycle with clarity and precision.

## Overview

MCP TDD enables any reasoning model to systematically implement features using test-driven development methodology. The server provides tools that enforce the TDD workflow while remaining intuitive and flexible.

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

- **tdd_consult** - Consult with mcp-consult (Ollama models) for complex design decisions
- **tdd_checkpoint** - Save current state for rollback capability
- **tdd_rollback** - Return to previous checkpoint
- **tdd_coverage** - Analyze test coverage metrics
- **tdd_compare_approaches** - Compare multiple implementation strategies

## Installation

1. Ensure you have Node.js 18+ installed
2. Install dependencies and build:

```bash
npm install
npm run build
```

## Usage

Start the MCP TDD server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## TDD Workflow Guide

### Step 1: Initialize a TDD Cycle

```javascript
{
  "tool": "tdd_init_cycle",
  "parameters": {
    "feature": "user authentication",
    "description": "Implement JWT-based user login",
    "testFramework": "jest",
    "language": "typescript"
  }
}
```

### Step 2: Write Failing Tests (RED)

```javascript
{
  "tool": "tdd_write_test",
  "parameters": {
    "testFile": "src/auth/login.test.ts",
    "testName": "should return JWT token on valid credentials",
    "testCode": "test('should return JWT token on valid credentials', () => {...})",
    "expectedToFail": true
  }
}
```

### Step 3: Run Tests (Verify RED)

```javascript
{
  "tool": "tdd_run_tests",
  "parameters": {
    "testPattern": "login.test.ts",
    "expectation": "fail"
  }
}
```

### Step 4: Implement Code (GREEN)

```javascript
{
  "tool": "tdd_implement",
  "parameters": {
    "implementationFile": "src/auth/login.ts",
    "code": "export function login(credentials) {...}",
    "testsCovered": ["should return JWT token on valid credentials"]
  }
}
```

### Step 5: Run Tests (Verify GREEN)

```javascript
{
  "tool": "tdd_run_tests",
  "parameters": {
    "testPattern": "login.test.ts",
    "expectation": "pass"
  }
}
```

### Step 6: Refactor (Optional)

```javascript
{
  "tool": "tdd_refactor",
  "parameters": {
    "file": "src/auth/login.ts",
    "changes": "Extract validation logic to separate function",
    "maintainTests": true
  }
}
```

### Step 7: Complete Cycle

```javascript
{
  "tool": "tdd_complete_cycle",
  "parameters": {
    "summary": "Implemented JWT authentication with validation",
    "testsAdded": 5,
    "testsPassing": 5
  }
}
```

## Tool Descriptions

### tdd_init_cycle

**Purpose**: Start a new TDD development cycle

**Parameters**:
- `feature` (required): Feature name or bug ID
- `description` (required): What you're building
- `testFramework` (optional): jest, vitest, mocha, etc.
- `language` (optional): typescript, javascript, python, etc.
- `files` (optional): Files involved in this cycle

**Returns**: Cycle ID and initialization status

---

### tdd_write_test

**Purpose**: Create or update test cases (RED phase)

**Parameters**:
- `testFile` (required): Path to test file
- `testName` (required): Descriptive test name
- `testCode` (required): Test implementation
- `expectedToFail` (required): true for RED phase
- `category` (optional): unit, integration, e2e

**Returns**: Test created confirmation

**Rules**:
- Tests must be written BEFORE implementation
- Tests should fail initially (RED phase)
- Use descriptive test names that explain behavior

---

### tdd_run_tests

**Purpose**: Execute tests and validate current phase

**Parameters**:
- `testPattern` (optional): Specific tests to run (default: all)
- `expectation` (required): "fail" (RED) or "pass" (GREEN)
- `coverage` (optional): Include coverage report

**Returns**: Test results, pass/fail counts, coverage metrics

**Phase Validation**:
- RED: Expects at least one test failure
- GREEN: Expects all tests to pass

---

### tdd_implement

**Purpose**: Write implementation code (GREEN phase)

**Parameters**:
- `implementationFile` (required): Path to implementation file
- `code` (required): Implementation code
- `testsCovered` (required): Array of test names this code addresses
- `minimal` (optional): true to enforce minimal implementation

**Returns**: Implementation confirmation

**Rules**:
- Only write code to make failing tests pass
- Keep implementation minimal (no gold-plating)
- Run tests immediately after implementation

---

### tdd_refactor

**Purpose**: Improve code quality while maintaining tests

**Parameters**:
- `file` (required): File to refactor
- `changes` (required): Description of refactoring
- `maintainTests` (required): Must be true
- `autoTest` (optional): Run tests after refactoring

**Returns**: Refactoring status and test results

**Rules**:
- All tests must continue passing
- No new functionality in refactor phase
- Focus on: naming, structure, duplication, readability

---

### tdd_status

**Purpose**: Get current cycle status and guidance

**Parameters**: None

**Returns**:
- Current phase (RED/GREEN/REFACTOR)
- Tests written/passing/failing
- Next recommended action
- Cycle duration
- Files modified

**Use this tool frequently** to stay oriented in the TDD workflow

---

### tdd_complete_cycle

**Purpose**: Finalize current TDD cycle

**Parameters**:
- `summary` (required): What was accomplished
- `testsAdded` (required): Number of new tests
- `testsPassing` (required): Total passing tests
- `notes` (optional): Additional observations

**Returns**: Cycle completion report

**Requirements**:
- All tests must be passing
- At least one test added
- Implementation code present

---

### tdd_consult

**Purpose**: Consult mcp-consult for complex decisions

**Parameters**:
- `question` (required): Design question or problem
- `context` (required): Current TDD cycle context
- `model` (optional): Specific Ollama model
- `expectation` (optional): What kind of answer you need

**Returns**: Consultation response from Ollama model

**Use when**:
- Design decisions are unclear
- Multiple approaches exist
- Complex architecture needed
- Need expert perspective

**Requires**: mcp-consult server available

---

### tdd_checkpoint

**Purpose**: Save current state for potential rollback

**Parameters**:
- `checkpointName` (required): Descriptive name
- `reason` (optional): Why creating checkpoint

**Returns**: Checkpoint ID and saved state

---

### tdd_rollback

**Purpose**: Restore to previous checkpoint

**Parameters**:
- `checkpointId` (required): Checkpoint to restore

**Returns**: Restoration status

---

### tdd_coverage

**Purpose**: Analyze test coverage metrics

**Parameters**:
- `files` (optional): Specific files to analyze
- `threshold` (optional): Minimum coverage percentage

**Returns**: Detailed coverage report

---

### tdd_compare_approaches

**Purpose**: Compare multiple implementation strategies

**Parameters**:
- `approaches` (required): Array of approach descriptions
- `criteria` (required): Evaluation criteria
- `useConsult` (optional): Leverage mcp-consult for analysis

**Returns**: Comparative analysis with recommendation

## Configuration

### Environment Variables

- `TEST_FRAMEWORK` - Default test framework (jest, vitest, mocha)
- `MIN_COVERAGE` - Minimum coverage threshold (default: 80)
- `TDD_STRICT_MODE` - Enforce strict TDD rules (default: true)
- `OLLAMA_BASE_URL` - Ollama endpoint for tdd_consult (default: http://localhost:11434)
- `CHECKPOINT_DIR` - Directory for checkpoints (default: .tdd-checkpoints)
- `TDD_LOG_LEVEL` - Logging verbosity (debug, info, warn, error)

### Configuration File (.tddrc.json)

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
    "integration": "**/*.integration.ts"
  }
}
```

## Best Practices for AI Models

### 1. Always Check Status

Before any action, call `tdd_status` to understand current phase and state.

### 2. Follow Phase Order

- RED → GREEN → REFACTOR
- Never skip phases
- Multiple RED-GREEN cycles are OK before REFACTOR

### 3. Test First, Always

- Write tests before implementation
- Verify tests fail before implementing (RED)
- Verify tests pass after implementing (GREEN)

### 4. Minimal Implementation

In GREEN phase, write only enough code to pass tests. Resist gold-plating.

### 5. Refactor Courageously

With passing tests, refactor confidently. Tests are your safety net.

### 6. Use Checkpoints

Create checkpoints before:
- Major refactoring
- Risky implementations
- Trying alternative approaches

### 7. Consult When Stuck

If design decisions are complex, use `tdd_consult` to leverage external reasoning.

### 8. Complete Cycles

Always call `tdd_complete_cycle` to maintain clean state for next feature.

## Integration with mcp-consult

When mcp-consult is available, `tdd_consult` enables:

- **Design consultation**: Ask Ollama models about architecture decisions
- **Code review**: Get alternative perspectives on implementations
- **Test strategy**: Consult on test coverage and approach
- **Debugging**: Reason through failing tests with external models

Example consultation:

```javascript
{
  "tool": "tdd_consult",
  "parameters": {
    "question": "Should I use factory pattern or dependency injection for database connections?",
    "context": {
      "cycle": "user-auth-implementation",
      "phase": "RED",
      "language": "typescript",
      "testFramework": "jest"
    },
    "model": "qwen2.5-coder:32b"
  }
}
```

## Example: Complete TDD Session

```
1. tdd_init_cycle({ feature: "email-validation" })
2. tdd_status() → Phase: READY
3. tdd_write_test({ test for valid email format })
4. tdd_run_tests({ expectation: "fail" }) → RED confirmed
5. tdd_implement({ regex-based validation })
6. tdd_run_tests({ expectation: "pass" }) → GREEN confirmed
7. tdd_write_test({ test for invalid email })
8. tdd_run_tests({ expectation: "fail" }) → RED confirmed
9. tdd_implement({ enhanced validation })
10. tdd_run_tests({ expectation: "pass" }) → GREEN confirmed
11. tdd_refactor({ extract validation to separate function })
12. tdd_run_tests({ expectation: "pass" }) → Tests still pass
13. tdd_coverage() → 95% coverage
14. tdd_complete_cycle({ summary: "Email validation complete" })
```

## Error Handling

The server enforces TDD rules and will return errors for:

- Implementing before writing tests
- Completing cycle with failing tests
- Refactoring without passing tests
- Skipping phases
- Running tests without expectation

These errors guide models to follow proper TDD methodology.

## Testing the TDD Server

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Requirements

- Node.js 18+
- Test framework installed (jest, vitest, mocha, etc.)
- Optional: Ollama running locally for tdd_consult (http://localhost:11434)
- Optional: mcp-consult server for advanced consultation features

## Docker Support

Build and run with Docker:

```bash
docker build -t mcp-tdd .
docker run -p 3000:3000 mcp-tdd
```

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- New tools follow TDD principles
- Tools are intuitive for AI reasoning models
- Documentation is clear and comprehensive
- Tests are included

---

**Remember**: TDD is not about tests. It's about design through tests. This MCP server helps AI models design better software by thinking test-first.

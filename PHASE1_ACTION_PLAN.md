# Phase 1 Action Plan - Foundation & Tooling

**Duration**: Week 1 (5-7 days)  
**Status**: 🟡 Ready to Start  
**Dependencies**: None  
**Risk Level**: Low

---

## Overview

This phase establishes the foundation for the entire refactoring effort by adding modern development tooling, CI/CD pipeline, and quality gates. All changes in this phase are non-breaking and additive.

---

## Tasks Breakdown

### Task 1.1: Install Development Dependencies

**Estimated Time**: 30 minutes  
**Priority**: High

```bash
cd /home/caseyjparker/MCP/mcp-tdd

# Install linting and formatting tools
pnpm add -D \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier

# Install git hooks
pnpm add -D husky lint-staged

# Install coverage tools
pnpm add -D @vitest/coverage-v8
```

**Validation**: Run `pnpm list` and verify all packages installed

---

### Task 1.2: Configure ESLint

**Estimated Time**: 20 minutes  
**Priority**: High

Create `.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "env": {
    "node": true,
    "es2022": true
  },
  "ignorePatterns": ["dist/", "node_modules/", "*.js"]
}
```

Create `.eslintignore`:

```
dist/
node_modules/
*.js
*.d.ts
coverage/
```

**Validation**: Run `pnpm eslint src/**/*.ts --max-warnings 10` (allow some initial warnings)

---

### Task 1.3: Configure Prettier

**Estimated Time**: 10 minutes  
**Priority**: High

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```
dist/
node_modules/
coverage/
pnpm-lock.yaml
*.md
```

**Validation**: Run `pnpm prettier --check 'src/**/*.ts'`

---

### Task 1.4: Update package.json Scripts

**Estimated Time**: 15 minutes  
**Priority**: High

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "clean": "npx rimraf dist/ node_modules/",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "demo": "node dist/demo-client.js",
    "dev:demo": "ts-node src/demo-client.ts",
    "test": "vitest run --reporter default",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint 'src/**/*.ts'",
    "lint:fix": "eslint 'src/**/*.ts' --fix",
    "format": "prettier --write 'src/**/*.ts'",
    "format:check": "prettier --check 'src/**/*.ts'",
    "typecheck": "tsc --noEmit",
    "ci": "pnpm run lint && pnpm run format:check && pnpm run typecheck && pnpm run test:coverage && pnpm run build",
    "prepare": "husky install",
    "reset-state": "bash scripts/reset-state.sh"
  }
}
```

**Validation**: Run each new script to ensure they work

---

### Task 1.5: Setup Husky Git Hooks

**Estimated Time**: 15 minutes  
**Priority**: Medium

```bash
# Initialize husky
pnpm exec husky install

# Create pre-commit hook
pnpm exec husky add .husky/pre-commit "pnpm lint-staged"

# Create commit-msg hook (optional, for conventional commits)
pnpm exec husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

Create `.lintstagedrc.json`:

```json
{
  "*.ts": ["eslint --fix", "prettier --write"]
}
```

**Validation**: Make a test commit and verify hooks run

---

### Task 1.6: Configure Coverage Thresholds

**Estimated Time**: 10 minutes  
**Priority**: Medium

Update `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/', 'test/', '**/*.d.ts', 'src/types/', 'src/tdd-demo.ts'],
      thresholds: {
        lines: 60, // Start low, gradually increase
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
});
```

**Validation**: Run `pnpm test:coverage` and verify it passes

---

### Task 1.7: Create GitHub Actions CI/CD Pipeline

**Estimated Time**: 30 minutes  
**Priority**: High

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint Code
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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm run lint

      - name: Check formatting
        run: pnpm run format:check

      - name: TypeScript type check
        run: pnpm run typecheck

  test:
    name: Run Tests
    needs: lint
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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests with coverage
        run: pnpm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-mcp-tdd

  build:
    name: Build Project
    needs: test
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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  release:
    name: Create Release
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
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

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/

      - name: Create Release (if tagged)
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Validation**: Push to GitHub and verify workflow runs

---

### Task 1.8: Initial Code Cleanup

**Estimated Time**: 1-2 hours  
**Priority**: Medium

Run automated fixes:

```bash
# Fix all auto-fixable linting issues
pnpm run lint:fix

# Format all code
pnpm run format

# Run tests to ensure nothing broke
pnpm run test

# Commit the changes
git add .
git commit -m "chore: apply initial linting and formatting"
```

**Validation**: All linting and formatting checks pass, tests still pass

---

### Task 1.9: Add Status Badges to README

**Estimated Time**: 10 minutes  
**Priority**: Low

Add to top of README.md:

```markdown
# MCP TDD (Test-Driven Development) Server

[![CI/CD](https://github.com/YOUR_USERNAME/mcp-tdd/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/YOUR_USERNAME/mcp-tdd/actions)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/mcp-tdd/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/mcp-tdd)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
```

**Validation**: Badges render correctly on GitHub

---

### Task 1.10: Document New Tooling

**Estimated Time**: 20 minutes  
**Priority**: Medium

Create `CONTRIBUTING.md`:

```markdown
# Contributing to MCP-TDD

## Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`
4. Start development: `pnpm run build:watch`

## Code Quality

- **Linting**: `pnpm run lint`
- **Formatting**: `pnpm run format`
- **Type Checking**: `pnpm run typecheck`
- **Testing**: `pnpm run test:coverage`

## Pre-commit Hooks

Husky will automatically run linting and formatting before each commit.

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Follow conventional commit format
4. Wait for CI checks to pass
```

**Validation**: Documentation is clear and accurate

---

## Validation Checklist

Before marking Phase 1 complete, verify:

- [ ] All dev dependencies installed
- [ ] ESLint configuration working
- [ ] Prettier configuration working
- [ ] Husky hooks working on commit
- [ ] All npm scripts working
- [ ] Coverage thresholds set (and passing)
- [ ] GitHub Actions workflow created
- [ ] CI pipeline running successfully
- [ ] Code formatted and linted
- [ ] All existing tests still passing
- [ ] README badges added
- [ ] CONTRIBUTING.md created

---

## Success Criteria

✅ **All tests passing**: Current 14 tests still work  
✅ **Linting clean**: No errors, warnings acceptable  
✅ **Formatting applied**: All files formatted  
✅ **CI/CD operational**: GitHub Actions running  
✅ **Coverage baseline**: Current coverage measured  
✅ **No regressions**: Existing functionality intact

---

## Risks & Mitigation

| Risk                       | Impact | Mitigation                              |
| -------------------------- | ------ | --------------------------------------- |
| Linting errors break build | High   | Start with warnings only, gradually fix |
| Pre-commit hooks slow      | Medium | Optimize lint-staged config             |
| CI/CD costs                | Low    | Use GitHub free tier                    |
| Breaking changes           | High   | Extensive testing before merge          |

---

## Next Steps After Phase 1

Once Phase 1 is complete:

1. Review and merge changes
2. Tag as `v1.1.0-alpha` (tooling update)
3. Begin Phase 2: Handler Modularization
4. Use new tooling throughout Phase 2+

---

## Command Reference

```bash
# Run full quality check
pnpm run ci

# Fix all issues automatically
pnpm run lint:fix && pnpm run format

# Run tests with coverage
pnpm run test:coverage

# Type check without building
pnpm run typecheck

# Clean and rebuild
pnpm run clean && pnpm install && pnpm run build
```

---

**Phase 1 Status**: Ready to Execute  
**Estimated Total Time**: 4-6 hours  
**Difficulty**: Easy  
**Breaking Changes**: None

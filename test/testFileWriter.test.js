"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const testFileWriter_1 = require("../src/testFileWriter");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
(0, vitest_1.describe)('mergeTestIntoFile', () => {
    const testDir = '/tmp/test-writer-tests';
    const testFile = path_1.default.join(testDir, 'sample.test.ts');
    (0, vitest_1.beforeEach)(async () => {
        await promises_1.default.mkdir(testDir, { recursive: true });
    });
    (0, vitest_1.afterEach)(async () => {
        await promises_1.default.rm(testDir, { recursive: true, force: true });
    });
    (0, vitest_1.it)('should create new test file when none exists', async () => {
        const testCode = `import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});`;
        const result = await (0, testFileWriter_1.mergeTestIntoFile)(testFile, testCode);
        (0, vitest_1.expect)(result).toBe(true);
        const content = await promises_1.default.readFile(testFile, 'utf-8');
        (0, vitest_1.expect)(content).toBe(testCode);
    });
    (0, vitest_1.it)('should append new test to existing describe block', async () => {
        const existing = `import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do first thing', () => {
    expect(true).toBe(true);
  });
});`;
        await promises_1.default.writeFile(testFile, existing);
        const newTest = `  it('should do second thing', () => {
    expect(1 + 1).toBe(2);
  });`;
        const result = await (0, testFileWriter_1.mergeTestIntoFile)(testFile, newTest, 'MyFeature');
        (0, vitest_1.expect)(result).toBe(true);
        const content = await promises_1.default.readFile(testFile, 'utf-8');
        (0, vitest_1.expect)(content).toContain('should do first thing');
        (0, vitest_1.expect)(content).toContain('should do second thing');
        (0, vitest_1.expect)(content.match(/describe\(/g)?.length).toBe(1); // Only one describe block
    });
    (0, vitest_1.it)('should create new describe block when specified one does not exist', async () => {
        const existing = `import { describe, it, expect } from 'vitest';

describe('ExistingFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});`;
        await promises_1.default.writeFile(testFile, existing);
        const newTest = `describe('NewFeature', () => {
  it('should do new thing', () => {
    expect(2 + 2).toBe(4);
  });
});`;
        const result = await (0, testFileWriter_1.mergeTestIntoFile)(testFile, newTest);
        (0, vitest_1.expect)(result).toBe(true);
        const content = await promises_1.default.readFile(testFile, 'utf-8');
        (0, vitest_1.expect)(content).toContain('ExistingFeature');
        (0, vitest_1.expect)(content).toContain('NewFeature');
        (0, vitest_1.expect)(content.match(/describe\(/g)?.length).toBe(2);
    });
});

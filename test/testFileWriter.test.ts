import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mergeTestIntoFile } from '../src/testFileWriter';
import fs from 'fs/promises';
import path from 'path';

describe('mergeTestIntoFile', () => {
  const testDir = '/tmp/test-writer-tests';
  const testFile = path.join(testDir, 'sample.test.ts');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should create new test file when none exists', async () => {
    const testCode = `import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});`;

    const result = await mergeTestIntoFile(testFile, testCode);
    
    expect(result).toBe(true);
    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toBe(testCode);
  });

  it('should append new test to existing describe block', async () => {
    const existing = `import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do first thing', () => {
    expect(true).toBe(true);
  });
});`;

    await fs.writeFile(testFile, existing);

    const newTest = `  it('should do second thing', () => {
    expect(1 + 1).toBe(2);
  });`;

    const result = await mergeTestIntoFile(testFile, newTest, 'MyFeature');
    
    expect(result).toBe(true);
    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toContain('should do first thing');
    expect(content).toContain('should do second thing');
    expect(content.match(/describe\(/g)?.length).toBe(1); // Only one describe block
  });

  it('should create new describe block when specified one does not exist', async () => {
    const existing = `import { describe, it, expect } from 'vitest';

describe('ExistingFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});`;

    await fs.writeFile(testFile, existing);

    const newTest = `describe('NewFeature', () => {
  it('should do new thing', () => {
    expect(2 + 2).toBe(4);
  });
});`;

    const result = await mergeTestIntoFile(testFile, newTest);
    
    expect(result).toBe(true);
    const content = await fs.readFile(testFile, 'utf-8');
    expect(content).toContain('ExistingFeature');
    expect(content).toContain('NewFeature');
    expect(content.match(/describe\(/g)?.length).toBe(2);
  });
});

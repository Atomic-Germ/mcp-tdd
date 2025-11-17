import { expect, describe, it } from 'vitest';
import { TestQualityAnalyzer } from '../src/services/TestQualityAnalyzer.js';

describe('TestQualityAnalyzer', () => {
  it('should analyze and score basic test quality', () => {
    const analyzer = new TestQualityAnalyzer();

    const testCode = `
      it('should add two numbers', () => {
        const result = add(2, 3);
        expect(result).toBe(5);
      });
    `;

    const result = analyzer.analyzeTest(testCode, 'should add two numbers');

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('suggestions');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('TestQualityAnalyzer - Naming Convention Analysis', () => {
  it('should detect non-descriptive test names', () => {
    const analyzer = new TestQualityAnalyzer();

    const testCode = `
      it('test1', () => {
        expect(add(1, 1)).toBe(2);
      });
    `;

    const result = analyzer.analyzeTest(testCode, 'test1');

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        type: 'naming-convention',
        severity: 'high',
      }),
    );
  });

  it('should recognize good descriptive test names', () => {
    const analyzer = new TestQualityAnalyzer();

    const testCode = `
      it('should return sum of two positive numbers', () => {
        expect(add(2, 3)).toBe(5);
      });
    `;

    const result = analyzer.analyzeTest(testCode, 'should return sum of two positive numbers');

    const namingIssues = result.issues.filter(i => i.type === 'naming-convention');
    expect(namingIssues).toHaveLength(0);
  });
});

describe('TestQualityAnalyzer - Structure Analysis', () => {
  it('should identify missing AAA pattern structure', () => {
    const analyzer = new TestQualityAnalyzer();

    const testCode = `
      it('should validate user', () => {
        const user = { name: 'John' };
        expect(user).toBeDefined();
        const email = user.email;
        expect(email).toBeUndefined();
      });
    `;

    const result = analyzer.analyzeTest(testCode, 'should validate user');

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        type: 'structure',
        message: expect.stringContaining('AAA'),
      }),
    );
  });

  it('should recognize proper AAA pattern', () => {
    const analyzer = new TestQualityAnalyzer();

    const testCode = `
      it('should add two numbers', () => {
        // Arrange
        const a = 2;
        const b = 3;
        
        // Act
        const result = add(a, b);
        
        // Assert
        expect(result).toBe(5);
      });
    `;

    const result = analyzer.analyzeTest(testCode, 'should add two numbers');

    const structureIssues = result.issues.filter(i => i.type === 'structure');
    expect(structureIssues).toHaveLength(0);
  });
});

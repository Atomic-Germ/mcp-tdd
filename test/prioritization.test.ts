import { describe, it, expect } from 'vitest';
import { TestPrioritizer } from '../src/testPrioritization';

describe('TestPrioritizer', () => {
  it('should prioritize tests with recent failures higher', () => {
    const prioritizer = new TestPrioritizer();
    
    const tests = [
      { id: '1', name: 'stable', failureCount: 0, lastFailure: null },
      { id: '2', name: 'flaky', failureCount: 3, lastFailure: new Date('2024-01-01') },
    ];
    
    const sorted = prioritizer.prioritize(tests);
    
    expect(sorted[0].id).toBe('2');
  });

  it('should prioritize tests affected by code changes', () => {
    const prioritizer = new TestPrioritizer();
    
    const tests = [
      { id: '1', name: 'unaffected', failureCount: 0, lastFailure: null, affectedFiles: [] },
      { id: '2', name: 'affected', failureCount: 0, lastFailure: null, affectedFiles: ['module.ts'] },
    ];
    
    const sorted = prioritizer.prioritize(tests, { changedFiles: ['module.ts'] });
    
    expect(sorted[0].id).toBe('2');
  });
});

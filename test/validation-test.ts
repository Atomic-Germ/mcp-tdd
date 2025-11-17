import { describe, it, expect } from 'vitest';

describe('Expectation Validation Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  it('should fail intentionally', () => {
    expect(1 + 1).toBe(3); // This will fail
  });

  it('should also fail', () => {
    expect('hello').toBe('goodbye'); // This will also fail
  });
});

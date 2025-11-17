import { expect, describe, it } from 'vitest';
import { factorial } from '../src/utils/mathUtils.js';

describe('Math Utilities', () => {
  it('should calculate factorial correctly', () => {
    expect(factorial(0)).toBe(1);
    expect(factorial(1)).toBe(1);
    expect(factorial(5)).toBe(120);
    expect(factorial(10)).toBe(3628800);
  });
});

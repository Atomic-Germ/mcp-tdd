import { expect, describe, it } from 'vitest';
import { isPrime } from '../src/utils/mathUtils.js';

describe('Prime Number Checker', () => {
  it('should correctly identify prime numbers', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(4)).toBe(false);
    expect(isPrime(17)).toBe(true);
    expect(isPrime(20)).toBe(false);
    expect(isPrime(1)).toBe(false);
  });
});

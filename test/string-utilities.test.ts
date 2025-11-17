import { expect, describe, it } from 'vitest';
import { isPalindrome } from '../src/utils/stringUtils.js';

describe('String Utilities', () => {
  it('should correctly identify palindromes', () => {
    expect(isPalindrome('racecar')).toBe(true);
    expect(isPalindrome('hello')).toBe(false);
    expect(isPalindrome('a')).toBe(true);
    expect(isPalindrome('ab')).toBe(false);
    expect(isPalindrome('aba')).toBe(true);
  });
});

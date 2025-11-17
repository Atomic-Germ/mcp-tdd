import { expect, describe, it } from 'vitest';
import { reverseString } from '../src/utils/stringUtils.js';

describe('String Reversal', () => {
  it('should reverse strings correctly', () => {
    expect(reverseString('hello')).toBe('olleh');
    expect(reverseString('world')).toBe('dlrow');
    expect(reverseString('a')).toBe('a');
    expect(reverseString('')).toBe('');
  });
});

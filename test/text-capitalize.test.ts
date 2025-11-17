import { expect, describe, it } from 'vitest';
import { capitalize } from '../src/utils/textUtils.js';

describe('Text Utilities', () => {
  it('should capitalize first letter of strings', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
    expect(capitalize('a')).toBe('A');
    expect(capitalize('')).toBe('');
  });
});

import { describe, test, expect } from 'vitest';
import { validateMinLength } from '../src/string-validator.js';

describe('String Validator', () => {
  test('should validate minimum length', () => {
    expect(validateMinLength('hello', 3)).toBe(true);
    expect(validateMinLength('hi', 3)).toBe(false);
    expect(validateMinLength('', 1)).toBe(false);
  });
});
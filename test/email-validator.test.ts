import { expect, describe, it } from 'vitest';
import { isValidEmail } from '../src/utils/emailValidator.js';

describe('Email Validator', () => {
  it('should correctly validate email addresses', () => {
    // Arrange - valid emails
    const validEmails = ['user@example.com', 'test.email+tag@domain.co.uk', 'simple@test.org'];

    // Act & Assert - valid emails
    validEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(true);
    });

    // Arrange - invalid emails
    const invalidEmails = ['notanemail', '@example.com', 'user@', 'user..name@example.com', ''];

    // Act & Assert - invalid emails
    invalidEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(false);
    });
  });
});

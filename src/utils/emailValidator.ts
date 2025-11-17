// Email validation - checks for proper format and no consecutive dots
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSECUTIVE_DOTS = /\.\./;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check for consecutive dots
  if (CONSECUTIVE_DOTS.test(email)) {
    return false;
  }

  return EMAIL_REGEX.test(email);
}

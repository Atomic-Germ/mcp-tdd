const NON_ALPHANUMERIC = /[^a-z0-9]/g;

export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(NON_ALPHANUMERIC, '');
  const reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}

export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

export function reverseWords(str: string): string {
  return str.split(' ').reverse().join(' ');
}

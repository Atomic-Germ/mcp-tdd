const MIN_FACTORIAL = 0;
const BASE_FACTORIAL = 1;
const MIN_PRIME = 2;
const PRIME_STEP = 2;

export function factorial(n: number): number {
  if (n < MIN_FACTORIAL) {
    throw new Error('Factorial not defined for negative numbers');
  }
  if (n === MIN_FACTORIAL || n === BASE_FACTORIAL) {
    return BASE_FACTORIAL;
  }
  return n * factorial(n - 1);
}

export function isPrime(n: number): boolean {
  if (n < MIN_PRIME) return false;
  if (n === MIN_PRIME) return true;
  if (n % PRIME_STEP === 0) return false;

  for (let i = 3; i * i <= n; i += PRIME_STEP) {
    if (n % i === 0) return false;
  }

  return true;
}

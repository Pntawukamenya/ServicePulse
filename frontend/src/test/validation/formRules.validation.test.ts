import { describe, it, expect } from 'vitest';

/** Example validation aligned with typical form rules (min length, trim). */
export function meetsMinDescriptionLength(value: string, min = 10): boolean {
  return value.trim().length >= min;
}

describe('form rules (validation)', () => {
  it('rejects short trimmed text', () => {
    expect(meetsMinDescriptionLength('short')).toBe(false);
    expect(meetsMinDescriptionLength('   hi   ')).toBe(false);
  });

  it('accepts text at or above minimum', () => {
    expect(meetsMinDescriptionLength('1234567890')).toBe(true);
    expect(meetsMinDescriptionLength('  1234567890  ')).toBe(true);
  });
});

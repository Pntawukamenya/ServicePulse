import { describe, it, expect } from 'vitest';
import { getMatchForAgency } from './analyticsService';

describe('analyticsService (unit)', () => {
  describe('getMatchForAgency', () => {
    it('returns empty object when no agency code', () => {
      expect(getMatchForAgency(null)).toEqual({});
    });

    it('builds $or match for agency code and service_type prefix', () => {
      const m = getMatchForAgency('REG') as { $or?: unknown[] };
      expect(m.$or).toBeDefined();
      expect(Array.isArray(m.$or)).toBe(true);
    });
  });
});

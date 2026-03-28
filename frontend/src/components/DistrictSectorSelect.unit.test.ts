import { describe, it, expect } from 'vitest';
import { formatLocation, parseLocation } from './DistrictSectorSelect';

describe('DistrictSectorSelect helpers (unit)', () => {
  describe('formatLocation', () => {
    it('returns empty if district or sector missing', () => {
      expect(formatLocation('', 'S')).toBe('');
      expect(formatLocation('D', '')).toBe('');
    });
    it('formats district and sector', () => {
      expect(formatLocation('Gasabo', 'Remera')).toBe('Gasabo, Remera');
    });
    it('includes cell', () => {
      expect(formatLocation('Gasabo', 'Remera', 'Gikondo')).toBe('Gasabo, Remera, Gikondo');
    });
    it('includes village when cell present', () => {
      expect(formatLocation('Gasabo', 'Remera', 'Gikondo', 'Cell1')).toBe(
        'Gasabo, Remera, Gikondo, Cell1'
      );
    });
  });

  describe('parseLocation', () => {
    it('returns empty parts for nullish', () => {
      expect(parseLocation(null)).toEqual({
        district: '',
        sector: '',
        cell: '',
        village: '',
      });
    });
    it('splits comma-separated string', () => {
      expect(parseLocation('A, B, C, D')).toEqual({
        district: 'A',
        sector: 'B',
        cell: 'C',
        village: 'D',
      });
    });
  });
});

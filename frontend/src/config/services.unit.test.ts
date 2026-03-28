import { describe, it, expect } from 'vitest';
import {
  getAgencyFromServiceCode,
  getServicesByAgency,
  isValidServiceForAgency,
  getServiceDisplayName,
} from './services';

describe('services config (unit)', () => {
  describe('getAgencyFromServiceCode', () => {
    it('maps REG codes to REG', () => {
      expect(getAgencyFromServiceCode('REG_POWER_OUTAGE')).toBe('REG');
    });
    it('maps WASAC codes', () => {
      expect(getAgencyFromServiceCode('WASAC_PIPE_BURST')).toBe('WASAC');
    });
    it('maps EMERGENCY codes', () => {
      expect(getAgencyFromServiceCode('EMERGENCY_FIRE')).toBe('EMERGENCY');
    });
    it('returns null for unknown', () => {
      expect(getAgencyFromServiceCode('OTHER')).toBeNull();
    });
  });

  describe('getServicesByAgency', () => {
    it('returns REG list', () => {
      expect(getServicesByAgency('REG').length).toBeGreaterThan(0);
      expect(getServicesByAgency('REG')[0].agency).toBe('REG');
    });
    it('returns empty for invalid', () => {
      expect(getServicesByAgency('INVALID' as never)).toEqual([]);
    });
  });

  describe('isValidServiceForAgency', () => {
    it('accepts valid pair', () => {
      expect(isValidServiceForAgency('REG_POWER_OUTAGE', 'REG')).toBe(true);
    });
    it('rejects wrong agency', () => {
      expect(isValidServiceForAgency('REG_POWER_OUTAGE', 'WASAC')).toBe(false);
    });
  });

  describe('getServiceDisplayName', () => {
    it('uses t() when label exists', () => {
      const t = (key: string) => (key === 'services.reg.powerOutage' ? 'Power Outage' : key);
      expect(getServiceDisplayName('REG_POWER_OUTAGE', t)).toBe('Power Outage');
    });
    it('formats unknown code without underscores', () => {
      const t = (key: string) => key;
      const name = getServiceDisplayName('CUSTOM_CODE', t);
      expect(name).toMatch(/CUSTOM/i);
      expect(name).not.toContain('_');
    });
  });
});

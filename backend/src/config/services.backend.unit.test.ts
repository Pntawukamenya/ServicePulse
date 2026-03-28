/**
 * Backend service catalog — parity with frontend `config/services`.
 */
import { describe, it, expect } from 'vitest';
import {
  getServiceDisplayName,
  isValidServiceForAgency,
  getAgencyFromServiceCode,
  type AgencyCode,
} from './services';

describe('backend config/services (unit)', () => {
  describe('getAgencyFromServiceCode', () => {
    it('resolves REG / WASAC / EMERGENCY prefixes', () => {
      expect(getAgencyFromServiceCode('REG_POWER_OUTAGE')).toBe('REG');
      expect(getAgencyFromServiceCode('WASAC_PIPE_BURST')).toBe('WASAC');
      expect(getAgencyFromServiceCode('EMERGENCY_FIRE')).toBe('EMERGENCY');
    });
    it('returns null for unrelated codes', () => {
      expect(getAgencyFromServiceCode('OTHER')).toBeNull();
    });
  });

  describe('isValidServiceForAgency', () => {
    it('accepts registered service + agency pairs', () => {
      expect(isValidServiceForAgency('REG_POWER_OUTAGE', 'REG')).toBe(true);
      expect(isValidServiceForAgency('WASAC_PIPE_BURST', 'WASAC')).toBe(true);
    });
    it('rejects mismatched agency', () => {
      expect(isValidServiceForAgency('REG_POWER_OUTAGE', 'WASAC')).toBe(false);
    });
    it('returns false for invalid agency code', () => {
      expect(isValidServiceForAgency('REG_POWER_OUTAGE', 'INVALID' as AgencyCode)).toBe(false);
    });
  });

  describe('getServiceDisplayName', () => {
    it('returns human-readable label for known codes', () => {
      expect(getServiceDisplayName('REG_POWER_OUTAGE')).toContain('Power');
    });
    it('formats unknown codes without underscores', () => {
      const s = getServiceDisplayName('CUSTOM_CODE');
      expect(s).not.toContain('_');
    });
  });
});

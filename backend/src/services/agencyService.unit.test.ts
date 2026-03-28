import { describe, it, expect, vi, beforeEach } from 'vitest';
import Agency from '../models/Agency';
import { getAgencyByCode, getAgencyCode } from './agencyService';

vi.mock('../models/Agency', () => ({
  default: {
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}));

const MockAgency = Agency as unknown as {
  findById: ReturnType<typeof vi.fn>;
  findOne: ReturnType<typeof vi.fn>;
};

describe('agencyService (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgencyByCode', () => {
    it('returns null for empty code', async () => {
      await expect(getAgencyByCode('   ')).resolves.toBeNull();
      expect(MockAgency.findOne).not.toHaveBeenCalled();
    });

    it('normalizes code to uppercase and returns id + code', async () => {
      MockAgency.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ _id: { toString: () => 'abc123' }, code: 'REG' }),
        }),
      });
      const r = await getAgencyByCode('reg');
      expect(r).toEqual({ id: 'abc123', code: 'REG' });
      expect(MockAgency.findOne).toHaveBeenCalledWith({ code: 'REG' });
    });

    it('returns null when agency missing', async () => {
      MockAgency.findOne.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null),
        }),
      });
      await expect(getAgencyByCode('WASAC')).resolves.toBeNull();
    });
  });

  describe('getAgencyCode', () => {
    it('returns code from lean document', async () => {
      MockAgency.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ code: 'EMERGENCY' }),
        }),
      });
      await expect(getAgencyCode('id1')).resolves.toBe('EMERGENCY');
    });

    it('returns null when not found', async () => {
      MockAgency.findById.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(null),
        }),
      });
      await expect(getAgencyCode('x')).resolves.toBeNull();
    });
  });
});

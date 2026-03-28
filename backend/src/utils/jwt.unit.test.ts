import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken, type TokenPayload } from './jwt';

describe('jwt (unit)', () => {
  it('round-trips token payload', () => {
    const payload: TokenPayload = {
      userId: '507f1f77bcf86cd799439011',
      role: 'citizen',
    };
    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  it('includes optional agency fields when set', () => {
    const payload: TokenPayload = {
      userId: '507f1f77bcf86cd799439011',
      role: 'agency_employee',
      agencyId: '507f1f77bcf86cd799439012',
      agencyCode: 'REG',
    };
    const decoded = verifyToken(generateToken(payload));
    expect(decoded.agencyId).toBe(payload.agencyId);
    expect(decoded.agencyCode).toBe(payload.agencyCode);
  });
});

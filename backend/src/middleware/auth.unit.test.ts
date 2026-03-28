import { describe, it, expect, vi } from 'vitest';
import type { Response } from 'express';
import { requireRole, type AuthRequest } from './auth';

describe('auth middleware — requireRole (unit)', () => {
  it('calls next when role is allowed', () => {
    const mw = requireRole('citizen', 'agency_employee');
    const req = { userRole: 'citizen' } as AuthRequest;
    const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when role is not allowed', () => {
    const mw = requireRole('super_admin');
    const req = { userRole: 'citizen' } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    mw(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
  });

  it('returns 401 when userRole is missing', () => {
    const mw = requireRole('citizen');
    const req = {} as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { errorHandler, notFound } from './errorHandler';

vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
}));

describe('errorHandler middleware (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('notFound returns 404 JSON', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    notFound({} as Request, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Route not found' });
  });

  it('errorHandler sends status and error message', () => {
    const err = Object.assign(new Error('boom'), { statusCode: 418 });
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();
    errorHandler(err, {} as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'boom' })
    );
  });
});

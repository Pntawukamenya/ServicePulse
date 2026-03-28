import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

/**
 * Essential platform checks: security headers + auth gate on API routes (no DB required).
 */
describe('API security (integration)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /health includes security-related headers from Helmet', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
  });

  it('GET /api/reports/my-reports without token returns 401', async () => {
    const res = await request(app).get('/api/reports/my-reports').expect(401);
    expect(res.body).toMatchObject({ error: expect.stringMatching(/auth/i) });
  });

  it('POST /api/reports without token returns 401', async () => {
    const res = await request(app).post('/api/reports').send({}).expect(401);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/agency/dashboard path without token returns 404 or 401 (no public leak)', async () => {
    const res = await request(app).get('/api/reports/agency');
    expect([401, 404]).toContain(res.status);
  });
});

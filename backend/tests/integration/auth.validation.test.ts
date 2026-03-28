import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

/**
 * System / validation: express-validator rejects invalid bodies before DB.
 */
describe('auth validation (system)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it('POST /api/auth/login rejects empty body with 400 and errors array', async () => {
    const res = await request(app).post('/api/auth/login').send({}).expect(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/register rejects missing terms', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        identifier: 'a@b.com',
        password: 'secret12',
        role: 'citizen',
        termsAccepted: false,
      })
      .expect(400);
    expect(res.body.errors).toBeDefined();
  });
});

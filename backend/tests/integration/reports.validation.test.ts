import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { generateToken } from '../../src/utils/jwt';

/**
 * Validation: express-validator on report routes (requires valid JWT only; no MongoDB).
 */
describe('reports API validation (system)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it('POST /api/reports with citizen token but empty body returns 400 with errors', async () => {
    const token = generateToken({
      userId: '507f1f77bcf86cd799439011',
      role: 'citizen',
    });
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('PUT /api/reports/:id/status with agency token but invalid status returns 400', async () => {
    const token = generateToken({
      userId: '507f1f77bcf86cd799439012',
      role: 'agency_employee',
      agencyId: '507f1f77bcf86cd799439099',
      agencyCode: 'REG',
    });
    const res = await request(app)
      .put('/api/reports/507f1f77bcf86cd799439011/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'not_a_real_status' })
      .expect(400);
    expect(res.body.errors?.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

describe('HTTP integration', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /health returns ok JSON', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.body.timestamp).toBeDefined();
    expect(() => new Date(res.body.timestamp)).not.toThrow();
  });

  it('GET /unknown returns 404', async () => {
    const res = await request(app).get('/no-such-route').expect(404);
    expect(res.body).toMatchObject({ error: 'Route not found' });
  });
});

import { describe, it, expect } from 'vitest';
import api from './api';

describe('api client (unit)', () => {
  it('uses JSON content type', () => {
    expect(api.defaults.headers['Content-Type']).toContain('application/json');
  });

  it('has a baseURL ending with /api', () => {
    expect(api.defaults.baseURL).toMatch(/\/api$/);
  });
});

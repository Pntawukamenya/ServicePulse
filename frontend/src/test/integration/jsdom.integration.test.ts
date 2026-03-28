import { describe, it, expect } from 'vitest';

/**
 * Lightweight integration check: Vitest + jsdom + DOM APIs work together.
 * Replace or extend with Router / MSW / API tests when added.
 */
describe('frontend test stack (integration)', () => {
  it('provides a browser-like document', () => {
    const el = document.createElement('div');
    el.id = 'root';
    expect(el).toBeInstanceOf(HTMLDivElement);
    expect(document.getElementById('root')).toBeNull();
  });
});

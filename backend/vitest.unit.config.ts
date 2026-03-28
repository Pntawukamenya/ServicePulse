import { defineConfig } from 'vitest/config';

/** Unit tests only — run via `npm run test:unit` */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setupEnv.ts'],
    include: ['src/**/*.unit.test.ts'],
    pool: 'forks',
  },
});

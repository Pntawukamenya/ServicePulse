import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setupEnv.ts'],
    include: [
      'src/**/*.unit.test.ts',
      'tests/**/*.integration.test.ts',
      'tests/**/*.validation.test.ts',
    ],
    pool: 'forks',
  },
});

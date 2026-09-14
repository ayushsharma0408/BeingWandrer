import { defineConfig } from 'vitest/config';

const vitestConfig = defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup-env.ts'],
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});

export default vitestConfig;

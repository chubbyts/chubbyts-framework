import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.*'],
    coverage: {
      all: true,
      clean: true,
      reporter: ['clover', ['html', { subdir: 'html' }], 'json', 'lcovonly', 'text'],
      provider: 'v8',
      thresholds: {
        lines: 100,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
    },
  },
});

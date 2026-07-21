// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@gs': resolve(__dirname, './src/generated-sources'),
    },
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/coverage',
      exclude: ['src/generated-sources/**'],
    },
  },
});

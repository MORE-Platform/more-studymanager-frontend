/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    //TODO maybe remove on cleanup session
    target: 'esnext',
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __BUILD_BRANCH__: JSON.stringify(process.env.VITE_GIT_BRANCH),
    __BUILD_REVISION__: JSON.stringify(process.env.VITE_GIT_REVISION),
  },
  resolve: {
    alias: {
      '@gs': resolve(__dirname, './src/generated-sources'),
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_LOCAL_BACKEND
          ? 'http://localhost:8080/api'
          : 'https://studymanager.platform-test.more.redlink.io/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          return path.replace(/^\/api/, '');
        },
      },
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

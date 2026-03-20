/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      tailwindcss(),
      VueI18nPlugin({
        include: resolve(__dirname, './src/i18n/*.json'),
        fullInstall: false,
        compositionOnly: true,
        strictMessage: false,
      }),
    ],
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
        '@': resolve(__dirname, './src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-browser.js',
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: process.env.VITE_LOCAL_BACKEND
            ? 'http://localhost:8080/api'
            : env.VITE_MORE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      watch: {
        ignored: [
          '**/tests/coverage/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/src/generated/**', '**/src/generated-sources/**', '**/openapi/**'
        ],
      },
    },
  };
});

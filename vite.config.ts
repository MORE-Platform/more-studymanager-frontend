import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/vite-plugin-vue-i18n';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      defaultSFCLang: 'json',
      include: path.resolve('./src/i18n/en'),
    }),
  ],
  build: {
    //TODO maybe remove on cleanup session
    target: 'esnext',
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
});

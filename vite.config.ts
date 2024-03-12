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
      include: path.resolve(__dirname, './src/i18n/**'),
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
          ? 'https://studymanager.platform-test.more.redlink.io/api'
          : 'http://localhost:8080/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          return path.replace(/^\/api/, '');
        },
      },
    },
  },
});

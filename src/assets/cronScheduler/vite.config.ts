import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import federation from '@originjs/vite-plugin-federation';
import json from '@rollup/plugin-json';

export default defineConfig({
  plugins: [
    federation({
      name: 'remote-app',
      filename: 'remoteEntry.js',
      exposes: {
        './CronSchedulerConfiguration':
          './src/components/CronSchedulerConfiguration.vue',
        './TestButton': './src/components/TestButton.vue',
      },
      shared: ['vue', 'tailwindcss', path.resolve(__dirname, 'package.json')],
    }),
    vue(),
    vueI18n({
      runtimeOnly: false,
      compositionOnly: true,
      defaultSFCLang: 'json',
    }),
  ],
  build: {
    //TODO maybe remove on cleanup session
    target: 'esnext',
    rollupOptions: {
      plugins: [json()],
    },
  },
});

import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'

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
    target: 'esnext'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://studymanager.platform-test.more.redlink.io/api',
        //target: 'http://localhost:8080/api', // local
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        /*configure: (proxy, options) => {
          const username = 'more-mmb'
          const password = 'more-mmb'
          options.auth = `${username}:${password}`
        },*/
      },
    },
  },
})

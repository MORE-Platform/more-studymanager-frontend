import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import '../src/style.pcss'

import { createI18n } from 'vue-i18n'
import en from './i18n/en.json'

// 2. Create i18n instance with options
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en', // set fallback locale
  messages: Object.assign({ en: en }), // set locale messages
  // If you need to specify other options, you can set other options
  // ...
})

// PrimeVue
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';


// Router
import { Router } from './router'

const app = createApp(App)

app.use(Router)
app.use(i18n)
app.use(PrimeVue)
app.use(ConfirmationService);
app.use(DialogService);

app.mount('#app')

app.directive('tooltip', Tooltip);

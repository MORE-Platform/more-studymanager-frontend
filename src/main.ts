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
import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/bootstrap4-light-blue/theme.css'
import 'primeicons/primeicons.css'
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';

// Router
import { Router } from './router'
import {
  Configuration,
  ModulesApi,
  ParticipantsApi,
  StudiesApi,
} from 'more-configuration-api-client-ts'
import {StudyGroupsApi} from './generated-sources/openapi';

const app = createApp(App)

app.use(Router)
app.use(i18n)
app.use(PrimeVue)
app.use(ConfirmationService);

app.mount('#app')

app.directive('tooltip', Tooltip);

const modulesApi = new ModulesApi({
  basePath: '/api/v1',
} as Configuration)
app.provide('modulesApiClient', modulesApi)
const apiConfig = {
  basePath: '/api/v1',
} as Configuration;
const studiesApi = new StudiesApi(apiConfig)
app.provide('studiesApiClient', studiesApi)
const studiesGroupsApi = new StudyGroupsApi(apiConfig)
app.provide('studyGroupsApiClient', studiesGroupsApi)

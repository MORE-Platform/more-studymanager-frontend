/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { createApp } from 'vue';
import App from './App.vue';
import './index.pcss';
import '../src/style.pcss';
// PrimeVue
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
// Router
import { Router } from './router';
import AuthService from './service/AuthService';
import axios, { AxiosError } from 'axios';
import { createPinia } from 'pinia';
import i18n from './i18n/i18n';
import { useErrorHandling } from './composable/useErrorHandling';
import useLoader from './composable/useLoader';
import { useUiConfigApi } from './composable/useApi';
import { BuildInfo, FrontendConfiguration } from './generated-sources/openapi';

const { uiConfigApi } = useUiConfigApi();

const buildInfo = await uiConfigApi
  .getBuildInfo()
  .then((r) => r.data)
  .catch((err: AxiosError) => {
    console.info('Could not retrieve Build-Info from the backend', err.message);
    return {
      version: '0.0.0',
      date: new Date(0).toISOString(),
      branch: undefined,
      rev: undefined,
    } as BuildInfo;
  })
  .then((backend) => {
    return {
      frontend: {
        version: __APP_VERSION__,
        date: new Date(__BUILD_DATE__).toISOString(),
        branch: __BUILD_BRANCH__,
        rev: __BUILD_REVISION__,
      } as BuildInfo,
      backend,
    };
  });

const uiConfig = await uiConfigApi
  .getFrontendConfig()
  .then((r) => r.data)
  .catch((err: AxiosError) => {
    console.warn(
      'Could not retrieve UI-Config from remote server, using default fallback:',
      err.message,
    );
    return {
      title: 'Unknown Legacy Backend',
      auth: {
        server: 'https://auth.more.redlink.io',
        realm: 'Auth-Client-Test',
        clientId: 'oauth2-pkce-client',
      },
    } as FrontendConfiguration;
  });

const authService = new AuthService({
  url: uiConfig.auth.server,
  realm: uiConfig.auth.realm,
  clientId: uiConfig.auth.clientId,
});
const loggedIn = await authService.init();
if (!loggedIn) {
  window.location.reload();
}

axios.interceptors.request.use(
  (config: any) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // for Node.js Express back-end
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);
useErrorHandling().activateGlobalErrorHandlingInterceptor();
useLoader().activateLoadingInterceptor();
const pinia = createPinia();

const app = createApp(App);
app.provide('buildInfo', buildInfo);
app.provide('uiConfig', uiConfig);
app.provide('authService', authService);

app.use(i18n);
app.use(Router);
app.use(PrimeVue);
app.use(ConfirmationService);
app.use(DialogService);
app.use(pinia);

app.mount('#app');

app.directive('tooltip', Tooltip);

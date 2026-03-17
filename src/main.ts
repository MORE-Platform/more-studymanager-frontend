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
import '../tailwind.config.ts';

// Styles
import './style.css';

// PrimeVue
import PrimeVue from 'primevue/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';

const MyPreset = definePreset(Aura, {
  primitive: {
    fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  options: {
    cssLayer: false
  },
  semantic: {
    borderRadius: {
      xsmall: '1px',
      small: '1.5px',
      medium: '2px',
      large: '3px',
      xlarge: '4px',
    },
    primary: {
      50: '#f1f4f7',
      100: '#d4dde6',
      200: '#b7c7d6',
      300: '#9ab1c5',
      400: '#7d9ab4',
      500: '#6E8FAC',
      600: '#63819b',
      700: '#4d6478',
      800: '#374856',
      900: '#212b34',
      950: '#161d22',
    },
    error: {
      50: '#fbf1f1',
      100: '#f7e3e3',
      200: '#eec8c8',
      300: '#e6acac',
      400: '#dd9191',
      500: '#d57575',
      600: '#aa5e5e',
      700: '#804646',
      800: '#552f2f',
      900: '#2b1717',
      950: '#1a0d0d',
    },
    success: {
      50: '#f2faf9',
      100: '#c9e5d1',
      200: '#a5d3b3',
      300: '#81c195',
      400: '#5db076',
      500: '#4BA767',
      600: '#3c8652',
      700: '#2d643e',
      800: '#1e4329',
      900: '#0f2115',
      950: '#08110b',
    },
    warn: {
      50: '#fcf7f0',
      100: '#f8eee0',
      200: '#f1ddc1',
      300: '#ebcca2',
      400: '#e4bb83',
      500: '#ddaa64',
      600: '#b18850',
      700: '#85663c',
      800: '#584428',
      900: '#2c2214',
      950: '#1a140c',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8f9fa',
          100: '#f1f1f1',
          200: '#e2e2e2',
          300: '#c6c6c6',
          400: '#a9a9a9',
          500: '#8d8d8d',
          600: '#707070',
          700: '#5a5a5a',
          800: '#434343',
          900: '#2d2d2d',
          950: '#1a1a1a',
        },
      },
    },
  },
});



// Router
import { Router } from './router';
import AuthService from './service/AuthService';
import axios, { AxiosError } from 'axios';
import { createPinia } from 'pinia';
import i18n from './i18n/i18n';
import { useErrorHandling } from './composable/useErrorHandling';
import useLoader from './composable/useLoader';
import { useUiConfigApi } from './composable/useApi';
import { BuildInfo, FrontendConfiguration } from './generated-sources';

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
app.directive('tooltip', Tooltip);

app.provide('buildInfo', buildInfo);
app.provide('uiConfig', uiConfig);
app.provide('authService', authService);

app.use(i18n);
app.use(Router);
app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: false,
      cssLayer: {
        name: 'primevue',
        order: 'theme, primevue, tailwind, more-styles, app-styles',
      },
    }
  },
});
app.use(ConfirmationService);
app.use(DialogService);
app.use(ToastService);
app.use(pinia);

app.mount('#app');

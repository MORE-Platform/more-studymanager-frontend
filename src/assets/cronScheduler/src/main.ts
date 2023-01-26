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
import { createPinia } from 'pinia';

const pinia = createPinia();

const app = createApp(App);
app.use(PrimeVue);
app.use(ConfirmationService);
app.use(DialogService);
app.use(pinia);

app.mount('#app');

app.directive('tooltip', Tooltip);

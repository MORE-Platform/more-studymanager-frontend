import '../src/style.pcss'
import '../src/index.css'

import { app, addParameters } from '@storybook/vue3'
import PrimeVue from 'primevue/config'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Row from 'primevue/row'
import ColumnGroup from 'primevue/columngroup'

import { createI18n, useI18n } from 'vue-i18n'
import de from '../src/i18n/de'
import en from '../src/i18n/en'

const i18n = createI18n({
  fallbackLocale: 'en', // set fallback locale
  messages: Object.assign({ en: en }), // set locale messages
  // If you need to specify other options, you can set other options
  // ...
})

app.use(i18n)
app.use(PrimeVue, { ripple: true })
app.component('DataTable', DataTable)
app.component('Row', Row)
app.component('Column', Column)
app.component('ColumnGroup', ColumnGroup)
app.component('Calendar', Calendar)

export const decorators = [
  (story) => ({
    components: {
      story,
    },
    template: '<story />',
    i18n,
  }),
]

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  decorators,
}

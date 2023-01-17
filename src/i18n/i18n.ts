import { createI18n, FallbackLocale, Locale } from 'vue-i18n';
import en from './en.json';

const fallbackLocale: FallbackLocale = 'en';
const localeEn: Locale = 'en';

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: localeEn,
  defaultLanguage: localeEn,
  fallbackLocale,
  availableLocales: [localeEn],
  messages: Object.assign({ en: en }), // set locale messages
  // If you need to specify other options, you can set other options
  // ...
});

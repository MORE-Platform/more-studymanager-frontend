import { createI18n, FallbackLocale, Locale } from 'vue-i18n';
import en from './en.json';
import de from './de.json';

const fallbackLocale: FallbackLocale = 'en';
const localeEn: Locale = 'en';
const localeDe: Locale = 'de';

let usersLanguage = window.navigator.language;
usersLanguage = usersLanguage.split('-')[0];

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: usersLanguage,
  defaultLanguage: localeEn,
  fallbackLocale,
  availableLocales: [localeEn, localeDe],
  messages: {
    en,
    de,
  },
  // If you need to specify other options, you can set other options
  // ...
});

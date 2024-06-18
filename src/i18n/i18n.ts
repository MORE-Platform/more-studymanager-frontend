/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import {
  createI18n,
  FallbackLocale,
  IntlDateTimeFormats,
  Locale,
} from 'vue-i18n';
import en from './en.json';
import de from './de.json';

const fallbackLocale: FallbackLocale = 'en';
const localeEn: Locale = 'en';
const localeDe: Locale = 'de';

let usersLanguage = window.navigator.language;
usersLanguage = usersLanguage.split('-')[0];

const datetimeFormats = {
  en: {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    long: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
    },
    longSec: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
    },
  },
  de: {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    long: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
    },
    longSec: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      second: '2-digit',
    },
  },
} as IntlDateTimeFormats;

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: usersLanguage,
  fallbackLocale,
  availableLocales: [localeEn, localeDe],
  messages: {
    en,
    de,
  },
  datetimeFormats,
  warnHtmlMessage: false,
});

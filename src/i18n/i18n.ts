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

const usersLanguage = window.navigator.language;

const commonDatetimeFormat = {
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
    hour12: false,
  },
  longSec: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: '2-digit',
  },
};

const datetimeFormats = {
  en: commonDatetimeFormat,
  'en-GB': commonDatetimeFormat,
  'en-US': commonDatetimeFormat,
  'en-AU': commonDatetimeFormat,
  'en-BZ': commonDatetimeFormat,
  'en-CA': commonDatetimeFormat,
  'en-IE': commonDatetimeFormat,
  'en-JM': commonDatetimeFormat,
  'en-NZ': commonDatetimeFormat,
  'en-PH': commonDatetimeFormat,
  'en-ZA': commonDatetimeFormat,
  'en-TT': commonDatetimeFormat,
  'en-VI': commonDatetimeFormat,
  'en-ZW': commonDatetimeFormat,
  de: commonDatetimeFormat,
  'de-AT': commonDatetimeFormat,
  'de-DE': commonDatetimeFormat,
  'de-CH': commonDatetimeFormat,
  'de-LI': commonDatetimeFormat,
  'de-LU': commonDatetimeFormat,
};

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
  datetimeFormats: datetimeFormats as IntlDateTimeFormats,
  warnHtmlMessage: false,
});

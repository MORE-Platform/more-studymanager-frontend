/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { defineStore } from 'pinia';

/**
 * Returns a date format string based on the language settings of the browser.
 * This function uses Intl.DateTimeFormat API to determine the order of day, month, and year
 * in the date format string (e.g., "dd.mm.yy" for German locale).
 *
 * @returns A string representing the date format based on browser language settings (e.g. dd.mm.yy or mm/dd/yy).
 */
function getBrowserDateFormat(): string {
  function formatMapper(value: string): string {
    switch (value) {
      case 'day':
        return 'dd';
      case 'month':
        return 'mm';
      case 'year':
        return 'yy';
      default:
        console.log('Unknown Intl.DateTimeFormat value:', value);
        return '';
    }
  }

  const sampleDate = new Date(2023, 6, 17);
  const usersLanguage = window.navigator.language;
  const dateFormat = new Intl.DateTimeFormat(usersLanguage).formatToParts(
    sampleDate,
  );

  const parts = dateFormat.map((part) =>
    part.type === 'literal' ? part.value : formatMapper(part.type),
  );

  return parts.join('');
}

export const useGlobalStore = defineStore('global', {
  state: () => ({
    dateFormat: getBrowserDateFormat(),
  }),
  getters: {
    getDateFormat: (state) => state.dateFormat,
  },
});

/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { I18n } from 'vue-i18n';

/** Tell TS + Vue that $t within components translates strings. */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof I18n.prototype.t; // Add $t to Vue's component properties
    $d: (value: Date | number, key?: string, locale?: string) => string; // For date formatting
  }
}

export {};

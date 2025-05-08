import { I18n } from 'vue-i18n';

/** Tell TS + Vue that $t within components translates strings. */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: typeof I18n.prototype.t; // Add $t to Vue's component properties
    $d: (value: Date | number, key?: string, locale?: string) => string; // For date formatting
  }
}

export {};

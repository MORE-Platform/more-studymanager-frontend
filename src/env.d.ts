/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;
declare const __BUILD_BRANCH__: string;
declare const __BUILD_REVISION__: string;
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, never>,
    any
  >;
  export default component;
}

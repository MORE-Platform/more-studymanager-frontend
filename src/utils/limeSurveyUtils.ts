/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
export function extractCurrentLimeDomain(): string {
  const hostnameParts = window.location.hostname.split('.');
  return hostnameParts.slice(1).join('.')
    ? `https://lime.${hostnameParts.slice(1).join('.')}/admin/`
    : 'https://lime.platform-test.more.redlink.io/admin';
}

/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
export const hasData = (data?: string | number): boolean =>
  !(
    data === undefined ||
    data === null ||
    (typeof data === 'string' && data.trim() === '') ||
    (typeof data === 'number' && isNaN(data))
  );

export const roundAndCeil = (input: number): number =>
  Math.ceil(Math.abs(input));

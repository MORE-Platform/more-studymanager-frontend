/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
export function isObjectEmpty(obj: Record<string, any>): boolean {
  return !obj || Object.keys(obj).length === 0;
}

export function shortenText(
  text?: string,
  maxLength: number = 180,
  append: string = '...',
): string | undefined {
  if (text && text.length > maxLength) {
    return text.substring(0, maxLength) + append;
  }
  return text;
}

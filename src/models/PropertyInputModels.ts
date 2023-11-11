/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Österreichische Vereinigung zur
 * Förderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
export interface StringEmit {
  value: string;
  index: number;
}
export interface IntegerPropertyEmit {
  value: number;
  index: number;
}

export interface StringListPropertyEmit {
  value: Array<string>;
  index: number;
}

export interface PropertyEmit {
  value: any;
  index: number;
}

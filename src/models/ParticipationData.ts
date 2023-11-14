/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 * Foerderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
export interface ParticipationDataMapping {
  participantAlias: string;
  observationId: number;
  observationTitle: string;
  studyGroupTitle: string;
  dataReceived: string;
  lastDataReceived: string;
}

export interface ParticipationDataGrouping {
  [key: number]: ParticipationDataMapping[];
}

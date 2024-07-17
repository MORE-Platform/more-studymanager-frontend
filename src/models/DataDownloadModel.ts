/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */

export interface DownloadData extends DownloadDataFilter {
  studyId: number;
}

export interface DownloadDataFilter {
  studyGroupId?: number[];
  participantId?: number[];
  observationId?: number[];
  from?: string;
  to?: string;
}

/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
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

export interface ObservationDataViewDataDTO {
  chartType: ChartType;
  view: ObservationDataViewInfo;
  labels: string[];
  data: ObservationDataViewDataRow[];
}

export interface ObservationDataViewDataRow {
  label: string;
  values: number[];
}

export interface ObservationsViewData {
  [key: string]: ObservationDataViewData[];
}
export interface ObservationDataViewData {
  chartType: ChartType | null;
  view: ObservationDataViewInfo;
  labels: string[];
  chartData: ChartProperties | null;
}

export interface ChartProperties {
  type: string;
  data: any;
  options: any;
}

export enum ChartType {
  PIE = 'pie',
  BAR = 'bar',
  LINE = 'line',
}

export interface ObservationDataViewInfo {
  name: string;
  label: string;
  title: string;
  description: string;
}

export interface ObservationDataViewFilter {
  studyGroupId?: number;
  participantId?: number;
  from?: string;
  to?: string;
}

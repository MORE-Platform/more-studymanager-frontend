export interface ParticipationDataMapping {
  participantAlias: string;
  observationId: number;
  observationTitle: string;
  studyGroupTitle: string;
  dataReceived: string;
  lastDataReceived: string;
}

export interface ParticipationDataGrouping {
  [key: number]: ParticipationDataMapping;
}

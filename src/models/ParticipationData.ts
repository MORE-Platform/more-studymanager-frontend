export interface ParticipationDataMapping {
  participantAlias: string;
  observationId: number;
  observationTitle: string;
  studyGroupTitle: string;
  dataReceived: string;
  lastDataReceived: string;
}

export interface ParticipationDataGroup {
  observationTitle: string;
  mapping: ParticipationDataMapping[];
}

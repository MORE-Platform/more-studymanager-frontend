import {Configuration, ParticipantsApi, StudiesApi, StudyGroupsApi, ObservationsApi} from '../generated-sources/openapi';

const apiConfig = {
  basePath: '/api/v1',
} as Configuration;

let studyGroupsApi:StudyGroupsApi;
let studiesApi:StudiesApi;
let participantsApi:ParticipantsApi;
let observationsApi:ObservationsApi;

export function useStudiesApi(): {
  studiesApi: StudiesApi
} {
  studiesApi = studiesApi || new StudiesApi(apiConfig, undefined, window.axios);
  return {
    studiesApi,
  }
}

export function useStudyGroupsApi(): {
  studyGroupsApi: StudyGroupsApi
} {
  studyGroupsApi = studyGroupsApi || new StudyGroupsApi(apiConfig, undefined, window.axios)
  return {
    studyGroupsApi,
  }
}

export function useParticipantsApi(): {
  participantsApi: ParticipantsApi
} {
  participantsApi = participantsApi || new ParticipantsApi(apiConfig, undefined, window.axios)
  return {
    participantsApi,
  }
}

export function useObservationsApi(): {
  observationsApi: ObservationsApi
} {
  observationsApi = observationsApi || new ObservationsApi(apiConfig, undefined, window.axios)
  return {
    observationsApi,
  }
}

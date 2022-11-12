import {Configuration, ParticipantsApi, StudiesApi, StudyGroupsApi} from '../generated-sources/openapi';

const apiConfig = {
  basePath: '/api/v1',
} as Configuration;
const studiesApi = new StudiesApi(apiConfig)
const studyGroupsApi = new StudyGroupsApi(apiConfig)
const participantsApi = new ParticipantsApi(apiConfig)

export function useStudiesApi(): {
  studiesApi: StudiesApi
} {
  return {
    studiesApi,
  }
}

export function useStudyGroupsApi(): {
  studyGroupsApi: StudyGroupsApi
} {
  return {
    studyGroupsApi,
  }
}

export function useParticipantsApi(): {
  participantsApi: ParticipantsApi
} {
  return {
    participantsApi,
  }
}

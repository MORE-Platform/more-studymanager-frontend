import {Configuration, StudiesApi, StudyGroupsApi} from '../generated-sources/openapi';

const apiConfig = {
  basePath: '/api/v1',
} as Configuration;
const studiesApi = new StudiesApi(apiConfig)
const studyGroupsApi = new StudyGroupsApi(apiConfig)

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

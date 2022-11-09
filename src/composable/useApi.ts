import { inject } from 'vue'
import {StudiesApi, StudyGroupsApi} from '../generated-sources/openapi';

export function useStudiesApi(): {
  studiesApi: StudiesApi
} {
  let studiesApi: StudiesApi | undefined = inject('studiesApiClient')
  if (!studiesApi) {
    studiesApi = new StudiesApi()
  }
  return {
    studiesApi,
  }
}

export function useStudyGroupsApi(): {
  studyGroupsApi: StudyGroupsApi
} {
  let studyGroupsApi: StudyGroupsApi | undefined = inject('studyGroupsApiClient')
  if (!studyGroupsApi) {
    studyGroupsApi = new StudyGroupsApi()
  }
  return {
    studyGroupsApi,
  }
}

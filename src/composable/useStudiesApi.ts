import { inject } from 'vue'
import {StudiesApi} from '../generated-sources/openapi';

export default function useStudiesApiClient(): {
  studyApi: StudiesApi
} {
  let studyApi: StudiesApi | undefined = inject('studiesApiClient')
  if (!studyApi) {
    studyApi = new StudiesApi()
  }
  return {
    studyApi,
  }
}

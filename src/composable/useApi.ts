import {
  Configuration,
  ParticipantsApi,
  StudiesApi,
  StudyGroupsApi,
  UsersApi,
  ObservationsApi,
  ComponentsApi,
  InterventionsApi,
  ImportExportApi
} from '../generated-sources/openapi';

const apiConfig = {
  basePath: '/api/v1',
} as Configuration;

let studyGroupsApi:StudyGroupsApi;
let studiesApi:StudiesApi;
let participantsApi:ParticipantsApi;
let usersApi: UsersApi
let observationsApi:ObservationsApi;
let componentsApi:ComponentsApi;
let interventionsApi:InterventionsApi;
let importExportApi: ImportExportApi;

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

export function useUsersApi(): {
  usersApi: UsersApi
} {
  usersApi = usersApi || new UsersApi(apiConfig, undefined, window.axios)
  return {
    usersApi,
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

export function useInterventionsApi(): {
  interventionsApi: InterventionsApi
} {
  interventionsApi = interventionsApi || new InterventionsApi(apiConfig, undefined, window.axios)
  return {
    interventionsApi,
  }
}

export function useComponentsApi(): {
  componentsApi: ComponentsApi
} {
  componentsApi = componentsApi || new ComponentsApi(apiConfig, undefined, window.axios)
  return {
    componentsApi,
  }
}

export function useImportExportApi(): {
  importExportApi: ImportExportApi
} {
  importExportApi = importExportApi || new ImportExportApi(apiConfig, undefined, window.axios)
  return {
    importExportApi,
  }
}

import {
  Configuration,
  ParticipantsApi,
  StudiesApi,
  StudyGroupsApi,
  UsersApi,
  ObservationsApi,
  ComponentsApi,
  InterventionsApi
} from '../generated-sources/openapi';

const apiConfig = {
  basePath: '/api/v1',
  baseOptions: {
    "Content-Type": "application/json",
  }
} as Configuration;

let studyGroupsApi:StudyGroupsApi;
let studiesApi:StudiesApi;
let participantsApi:ParticipantsApi;
let usersApi: UsersApi
let observationsApi:ObservationsApi;
let componentsApi:ComponentsApi;
let interventionsApi:InterventionsApi;

export function useStudiesApi(): {
  studiesApi: StudiesApi
} {
  studiesApi = studiesApi || new StudiesApi(apiConfig);
  return {
    studiesApi,
  }
}

export function useStudyGroupsApi(): {
  studyGroupsApi: StudyGroupsApi
} {
  studyGroupsApi = studyGroupsApi || new StudyGroupsApi(apiConfig)
  return {
    studyGroupsApi,
  }
}

export function useParticipantsApi(): {
  participantsApi: ParticipantsApi
} {
  participantsApi = participantsApi || new ParticipantsApi(apiConfig)
  return {
    participantsApi,
  }
}

export function useUsersApi(): {
  usersApi: UsersApi
} {
  usersApi = usersApi || new UsersApi(apiConfig)
  return {
    usersApi,
  }
}

export function useObservationsApi(): {
  observationsApi: ObservationsApi
} {
  observationsApi = observationsApi || new ObservationsApi(apiConfig)
  return {
    observationsApi,
  }
}

export function useInterventionsApi(): {
  interventionsApi: InterventionsApi
} {
  interventionsApi = interventionsApi || new InterventionsApi(apiConfig)
  return {
    interventionsApi,
  }
}

export function useComponentsApi(): {
  componentsApi: ComponentsApi
} {
  componentsApi = componentsApi || new ComponentsApi(apiConfig)
  return {
    componentsApi,
  }
}

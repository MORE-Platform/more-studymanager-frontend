/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { useQuery, UseQueryReturnType } from '@tanstack/vue-query';
import { useApplicationsApi } from '../composable/useApi';
import { MaybeRefOrGetter, toValue } from 'vue';

export const useStudyApplications = (
  studyId: MaybeRefOrGetter<number>,
): UseQueryReturnType<string[], Error> => {
  const { applicationsApi } = useApplicationsApi();

  return useQuery({
    queryKey: ['studies', studyId, 'applications'],
    queryFn: () =>
      applicationsApi
        .getStudyApplications(toValue(studyId))
        .then((res) => res.data),
    enabled: () => !!toValue(studyId),
  });
};

/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { useMutation, UseMutationReturnType, useQuery, useQueryClient, UseQueryReturnType } from '@tanstack/vue-query';
import { useParticipantsApi } from '../composable/useApi';
import { MaybeRefOrGetter, toValue } from 'vue';
import { ParticipantApplicationAccess } from '@gs';

export const useParticipantApplications = (
  studyId: MaybeRefOrGetter<number>,
  participantId: MaybeRefOrGetter<number>,
): UseQueryReturnType<ParticipantApplicationAccess[], Error> => {
  const { participantsApi } = useParticipantsApi();
  return useQuery({
    queryKey: [
      'studies',
      studyId,
      'participants',
      participantId,
      'applications',
    ],
    queryFn: () =>
      participantsApi
        .getParticipantApplications(toValue(studyId), toValue(participantId))
        .then((res) => res.data),
    enabled: () => !!toValue(studyId) && !!toValue(participantId),
  });
};

export const useParticipantAccessData = (
  studyId: MaybeRefOrGetter<number>,
  participantId: MaybeRefOrGetter<number>,
  application: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true,
): UseQueryReturnType<ParticipantApplicationAccess, Error> => {
  const { participantsApi } = useParticipantsApi();
  return useQuery({
    queryKey: [
      'studies',
      studyId,
      'participants',
      participantId,
      'application-access',
      application,
    ],
    queryFn: () =>
      participantsApi
        .getParticipantAccessData(
          toValue(studyId),
          toValue(participantId),
          toValue(application),
        )
        .then((res) => res.data),
    enabled: () =>
      !!toValue(studyId) &&
      !!toValue(participantId) &&
      !!toValue(application) &&
      toValue(enabled),
  });
};

export const useCreateParticipantAccessData = (): UseMutationReturnType<
  ParticipantApplicationAccess,
  Error,
  { studyId: number; participantId: number; application: string },
  unknown
> => {
  const { participantsApi } = useParticipantsApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studyId,
      participantId,
      application,
    }: {
      studyId: number;
      participantId: number;
      application: string;
    }) =>
      participantsApi
        .createParticipantAccessData(studyId, participantId, application)
        .then((res) => res.data),
    onSuccess: (_, { studyId, participantId, application }) => {
      queryClient.invalidateQueries({
        queryKey: [
          'studies',
          studyId,
          'participants',
          participantId,
          'application-access',
          application,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'studies',
          studyId,
          'participants',
          participantId,
          'applications',
        ],
      });
    },
  });
};

export const useDeleteParticipantApplicationAccessData =
  (): UseMutationReturnType<
    void,
    Error,
    {
      studyId: number;
      participantId: number;
      application: string;
      includeData?: boolean;
    },
    unknown
  > => {
    const { participantsApi } = useParticipantsApi();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        studyId,
        participantId,
        application,
        includeData,
      }: {
        studyId: number;
        participantId: number;
        application: string;
        includeData?: boolean;
      }) =>
        participantsApi
          .deleteParticipantApplicationAccessData(
            studyId,
            participantId,
            application,
            includeData,
          )
          .then((res) => res.data),
      onSuccess: (_, { studyId, participantId, application }) => {
        queryClient
          .invalidateQueries({
            queryKey: [
              'studies',
              studyId,
              'participants',
              participantId,
              'application-access',
              application,
            ],
          })
          .then();
        queryClient
          .invalidateQueries({
            queryKey: [
              'studies',
              studyId,
              'participants',
              participantId,
              'applications',
            ],
          })
          .then();
      },
    });
  };

/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { useMutation, UseMutationReturnType, useQuery, useQueryClient, UseQueryReturnType } from '@tanstack/vue-query';
import { useParticipantsApi } from '../composable/useApi';
import { MaybeRefOrGetter, toValue } from 'vue';
import { Participant } from '@gs';

export const useParticipants = (
  studyId: MaybeRefOrGetter<number>,
): UseQueryReturnType<Participant[], Error> => {
  const { participantsApi } = useParticipantsApi();

  return useQuery({
    queryKey: ['studies', studyId, 'participants'],
    queryFn: () =>
      participantsApi
        .listParticipants(toValue(studyId))
        .then((res) => res.data),
    enabled: () => !!toValue(studyId),
  });
};

export const useParticipant = (
  studyId: MaybeRefOrGetter<number>,
  participantId: MaybeRefOrGetter<number>,
): UseQueryReturnType<Participant, Error> => {
  const { participantsApi } = useParticipantsApi();

  return useQuery({
    queryKey: ['studies', studyId, 'participants', participantId],
    queryFn: () =>
      participantsApi
        .getParticipant(toValue(studyId), toValue(participantId))
        .then((res) => res.data),
    enabled: () => !!toValue(studyId) && !!toValue(participantId),
  });
};

export const useCreateParticipants = (): UseMutationReturnType<
  Participant[],
  Error,
  { studyId: number; participants: Participant[] },
  unknown
> => {
  const { participantsApi } = useParticipantsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, participants }) =>
      participantsApi
        .createParticipants(studyId, participants)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'participants'],
      });
    },
  });
};

export const useUpdateParticipant = (): UseMutationReturnType<
  Participant,
  Error,
  { studyId: number; participantId: number; participant: Participant },
  unknown
> => {
  const { participantsApi } = useParticipantsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, participantId, participant }) =>
      participantsApi
        .updateParticipant(studyId, participantId, participant)
        .then((res) => res.data),
    onSuccess: (updatedParticipant, { studyId, participantId }) => {
      queryClient.setQueryData(
        ['studies', studyId, 'participants', participantId],
        updatedParticipant,
      );
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'participants'],
      });
    },
  });
};

export const useDeleteParticipant = (): UseMutationReturnType<
  void,
  Error,
  { studyId: number; participantId: number; includeData?: boolean },
  unknown
> => {
  const { participantsApi } = useParticipantsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, participantId, includeData }) =>
      participantsApi
        .deleteParticipant(studyId, participantId, includeData)
        .then((res) => res.data),
    onSuccess: (_, { studyId }) => {
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'participants'],
      });
    },
  });
};

export const useUpdateParticipantList = (): UseMutationReturnType<
  Participant[],
  Error,
  { studyId: number; participants: Participant[] },
  unknown
> => {
  const { participantsApi } = useParticipantsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, participants }) =>
      participantsApi
        .updateParticipantList(studyId, participants)
        .then((res) => res.data),
    onSuccess: (updatedParticipants, { studyId }) => {
      queryClient.setQueryData(
        ['studies', studyId, 'participants'],
        updatedParticipants,
      );
      queryClient.invalidateQueries({
        queryKey: ['studies', studyId, 'participants'],
      });
    },
  });
};

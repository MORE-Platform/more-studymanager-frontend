/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { useMutation, UseMutationReturnType, useQuery, useQueryClient, UseQueryReturnType } from '@tanstack/vue-query';
import { useMilestonesApi } from '../composable/useApi';
import { MaybeRefOrGetter, toValue } from 'vue';
import { ParticipantMilestone } from '@gs';

export const useParticipantMilestones = (
  studyId: MaybeRefOrGetter<number>,
  participantId: MaybeRefOrGetter<number>,
): UseQueryReturnType<ParticipantMilestone[], Error> => {
  const { milestonesApi } = useMilestonesApi();

  return useQuery({
    queryKey: ['studies', studyId, 'participants', participantId, 'milestones'],
    queryFn: () =>
      milestonesApi
        .listParticipantMilestones(toValue(studyId), toValue(participantId))
        .then((res) => res.data),
    enabled: () => !!toValue(studyId) && !!toValue(participantId),
  });
};

export const useCreateParticipantMilestone = (): UseMutationReturnType<
  ParticipantMilestone,
  Error,
  {
    studyId: number;
    participantId: number;
    milestoneId: number;
    dateTime: string;
  },
  unknown
> => {
  const { milestonesApi } = useMilestonesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, participantId, milestoneId, dateTime }) =>
      milestonesApi
        .createParticipantMilestone(studyId, participantId, {
          milestoneId,
          dateTime,
        })
        .then((res) => res.data),
    onSuccess: (_, { studyId, participantId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          'studies',
          studyId,
          'participants',
          participantId,
          'milestones',
        ],
      });
    },
  });
};

export const useUpdateParticipantMilestone = (): UseMutationReturnType<
  ParticipantMilestone,
  Error,
  {
    studyId: number;
    participantId: number;
    milestoneId: number;
    participantMilestone: ParticipantMilestone;
  },
  unknown
> => {
  const { milestonesApi } = useMilestonesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studyId,
      participantId,
      milestoneId,
      participantMilestone,
    }) =>
      milestonesApi
        .updateParticipantMilestone(
          studyId,
          participantId,
          milestoneId,
          participantMilestone,
        )
        .then((res) => res.data),
    onSuccess: (updated, { studyId, participantId }) => {
      queryClient.setQueryData(
        ['studies', studyId, 'participants', participantId, 'milestones'],
        (old: ParticipantMilestone[] | undefined) =>
          old?.map((pm) =>
            pm.milestoneId === updated.milestoneId ? updated : pm,
          ) ?? [updated],
      );
      queryClient.invalidateQueries({
        queryKey: [
          'studies',
          studyId,
          'participants',
          participantId,
          'milestones',
        ],
      });
    },
  });
};

export const useDeleteParticipantMilestone = (): UseMutationReturnType<
  void,
  Error,
  { studyId: number; participantId: number; milestoneId: number },
  unknown
> => {
  const { milestonesApi } = useMilestonesApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studyId, participantId, milestoneId }) =>
      milestonesApi
        .deleteParticipantMilestone(studyId, participantId, milestoneId)
        .then((res) => res.data),
    onSuccess: (_, { studyId, participantId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          'studies',
          studyId,
          'participants',
          participantId,
          'milestones',
        ],
      });
    },
  });
};

/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';
import { Milestone } from '@gs';
import { useMilestonesApi } from '../composable/useApi';
import { useErrorHandling } from '../composable/useErrorHandling';
import { AxiosError } from 'axios';
import i18n from '../i18n/i18n';

export const useMilestoneStore = defineStore('milestone', () => {
  const { milestonesApi } = useMilestonesApi();
  const { handleIndividualError } = useErrorHandling();

  // State
  const milestones: Ref<Milestone[]> = ref([]);

  // Actions
  async function getMilestones(studyId: number): Promise<void> {
    milestones.value = await milestonesApi
      .listMilestones(studyId)
      .then((response) =>
        response.data.sort((a, b) => a.orderIndex - b.orderIndex),
      )
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list milestones');
        return milestones.value;
      });
  }

  async function createMilestone(studyId: number, name: string): Promise<void> {
    await milestonesApi
      .createMilestone(studyId, { name })
      .then((response) => milestones.value.push(response.data))
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot create milestone'),
      );
  }

  async function updateMilestone(milestone: Milestone): Promise<void> {
    const position = milestones.value.findIndex(
      (m) => m.milestoneId === milestone.milestoneId,
    );
    if (position > -1) {
      await milestonesApi
        .updateMilestone(
          milestone.studyId as number,
          milestone.milestoneId as number,
          milestone,
        )
        .then((response) => milestones.value.splice(position, 1, response.data))
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot update milestone'),
        );
    }
  }

  async function deleteMilestone(milestone: Milestone): Promise<void> {
    try {
      await milestonesApi.deleteMilestone(
        milestone.studyId as number,
        milestone.milestoneId as number,
      );
      const position = milestones.value.findIndex(
        (m) => m.milestoneId === milestone.milestoneId,
      );
      if (position > -1) {
        milestones.value.splice(position, 1);
      }
    } catch (error: any) {
      error.errorMessage =
        error.response?.status === 409
          ? i18n.global.t('milestone.dialog.error.conflictUsed')
          : i18n.global.t('global.error.generic');
      throw error;
    }
  }

  async function reorderMilestones(newOrder: Milestone[]): Promise<void> {
    // orderIndex is 0-based on the backend (the first milestone is 0)
    const reindexed = newOrder.map((milestone, index) => ({
      ...milestone,
      orderIndex: index,
    }));
    const changed = reindexed.filter((milestone, index) => {
      const current = milestones.value[index];
      return !current || current.milestoneId !== milestone.milestoneId;
    });
    milestones.value = reindexed;
    // sequential, not parallel: each update shifts every milestone in between
    // its old and new position on the backend, so concurrent calls would race
    for (const milestone of changed) {
      await milestonesApi
        .updateMilestone(
          milestone.studyId as number,
          milestone.milestoneId as number,
          milestone,
        )
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot reorder milestones'),
        );
    }
  }

  return {
    milestones,
    getMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,
  };
});

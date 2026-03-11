/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { ObservationGroup } from '@gs';
import { useObservationGroupsApi } from '../composable/useApi';
import i18n from '../i18n/i18n';
import { useErrorHandling } from '../composable/useErrorHandling';
import { AxiosError } from 'axios';

export const useObservationGroupStore = defineStore('observationGroup', () => {
  const { observationGroupsApi } = useObservationGroupsApi();
  const { handleIndividualError } = useErrorHandling();

  // State
  const observationGroups: Ref<ObservationGroup[]> = ref([]);

  // Actions
  async function getObservationGroups(studyId: number): Promise<void> {
    observationGroups.value = await observationGroupsApi
      .listObservationGroups(studyId)
      .then((response) => response.data)
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list study group');
        return observationGroups.value;
      });
  }
  async function createObservationGroups(studyId: number): Promise<void> {
    let title;
    let count = observationGroups.value.length;
    while (title === undefined) {
      count += 1;
      const _title = i18n.global.t('study.props.observationGroup', { size: count });
      if (!observationGroups.value.find((g) => g.title === _title)) {
        title = _title;
      }
    }
    await observationGroupsApi
      .createObservationGroup(studyId, {
        studyId,
        title,
      })
      .then((response) => observationGroups.value.push(response.data))
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot create study group'),
      );
  }

  async function getObservationGroup(studyId: number, observationGroupId: number): Promise<void> {
    const position = observationGroups.value.findIndex(
      (observationGroupItem) =>
        observationGroupItem.observationGroupId === observationGroupId,
    );
    await observationGroupsApi
      .getObservationGroup(studyId, observationGroupId)
      .then((response) => {
        const observationGroup = response.data
        observationGroups.value.splice(position, 1, observationGroup)
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list study group');
      })
      .finally(() => {
        return observationGroups.value;
      });
  }

  async function updateObservationGroup(studyid: number, observationGroup: ObservationGroup): Promise<void> {
    const position = observationGroups.value.findIndex(
      (observationGroupItem) =>
        observationGroupItem.observationGroupId === observationGroup.observationGroupId,
    );
    if (position > -1) {
      await observationGroupsApi
        .updateObservationGroup(
          observationGroup.studyId as number,
          observationGroup.observationGroupId as number,
          observationGroup,
        )
        .then(() => observationGroups.value.splice(position, 1, observationGroup))
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot update study group'),
        );
    }
  }

  function deleteObservationGroup(observationGroup: ObservationGroup): void {
    observationGroupsApi
      .deleteObservationGroup(
        observationGroup.studyId as number,
        observationGroup.observationGroupId as number,
      )
      .then(() => {
        const position = observationGroups.value.findIndex(
          (studyGroupItem) =>
            studyGroupItem.observationGroupId === observationGroup.observationGroupId &&
            studyGroupItem.studyId === observationGroup.studyId,
        );
        observationGroups.value.splice(position, 1);
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot delete study group'),
      );
  }

  return {
    observationGroups,
    createObservationGroups,
    getObservationGroups,
    updateObservationGroup,
    getObservationGroup,
    deleteObservationGroup
  };
});

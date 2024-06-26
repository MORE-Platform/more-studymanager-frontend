/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { Duration, StudyGroup } from '../generated-sources/openapi';
import { useStudyGroupsApi } from '../composable/useApi';
import i18n from '../i18n/i18n';
import { useErrorHandling } from '../composable/useErrorHandling';
import { AxiosError } from 'axios';
import { MoreStudyGroupTableMap } from '../models/MoreTableModel';

export const useStudyGroupStore = defineStore('studyGroup', () => {
  const { studyGroupsApi } = useStudyGroupsApi();
  const { handleIndividualError } = useErrorHandling();

  // State
  const studyGroups: Ref<StudyGroup[]> = ref([]);

  // Actions
  async function getStudyGroups(studyId: number): Promise<void> {
    studyGroups.value = await studyGroupsApi
      .listStudyGroups(studyId)
      .then((response) => response.data)
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list study group');
        return studyGroups.value;
      });
  }
  async function createStudyGroup(studyId: number): Promise<void> {
    let title;
    let count = studyGroups.value.length;
    while (title === undefined) {
      count += 1;
      const _title = i18n.global.t('study.props.studyGroup', { size: count });
      if (!studyGroups.value.find((g) => g.title === _title)) {
        title = _title;
      }
    }
    await studyGroupsApi
      .createStudyGroup(studyId, {
        studyId,
        title,
      })
      .then((response) => studyGroups.value.push(response.data))
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot create study group'),
      );
  }

  function deleteStudyGroup(studyGroup: StudyGroup): void {
    studyGroupsApi
      .deleteStudyGroup(
        studyGroup.studyId as number,
        studyGroup.studyGroupId as number,
      )
      .then(() => {
        const position = studyGroups.value.findIndex(
          (studyGroupItem) =>
            studyGroupItem.studyGroupId === studyGroup.studyGroupId &&
            studyGroupItem.studyId === studyGroup.studyId,
        );
        studyGroups.value.splice(position, 1);
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot delete study group'),
      );
  }
  async function updateStudyGroup(studyGroup: StudyGroup): Promise<void> {
    const position = studyGroups.value.findIndex(
      (studyGroupsItem) =>
        studyGroupsItem.studyGroupId === studyGroup.studyGroupId,
    );
    if (position > -1) {
      await studyGroupsApi
        .updateStudyGroup(
          studyGroup.studyId as number,
          studyGroup.studyGroupId as number,
          studyGroup,
        )
        .then(() => studyGroups.value.splice(position, 1, studyGroup))
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot update study group'),
        );
    }
  }

  function toStudyGroupMap(): MoreStudyGroupTableMap[] {
    return studyGroups.value.map((studyGroup: StudyGroup) => {
      return {
        studyId: studyGroup.studyId,
        studyGroupId: studyGroup.studyGroupId,
        title: studyGroup.title,
        purpose: studyGroup.purpose,
        durationValue: studyGroup.duration?.value,
        durationUnit: studyGroup.duration?.unit,
        numberOfParticipants: studyGroup.numberOfParticipants,
        created: studyGroup.created,
        modified: studyGroup.modified,
      } as MoreStudyGroupTableMap;
    });
  }

  function toStudyGroup(row: MoreStudyGroupTableMap): StudyGroup {
    let d: Duration | undefined = undefined;

    if (row.durationValue && row.durationUnit) {
      d = {
        value: row.durationValue,
        unit: row.durationUnit,
      } as Duration;
    }

    return {
      studyId: row.studyId,
      studyGroupId: row.studyGroupId,
      title: row.title,
      purpose: row.purpose,
      duration: d,
      numberOfParticipants: row.numberOfParticipants,
      created: row.created,
      modified: row.modified,
    } as StudyGroup;
  }

  const studyGroupMap: ComputedRef<Array<MoreStudyGroupTableMap>> = computed(
    () => toStudyGroupMap(),
  );

  return {
    studyGroups,
    studyGroupMap,
    getStudyGroups,
    createStudyGroup,
    deleteStudyGroup,
    updateStudyGroup,
    toStudyGroup,
  };
});

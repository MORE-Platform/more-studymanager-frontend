import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { StudyGroup } from '../generated-sources/openapi';
import { useStudyGroupsApi } from '../composable/useApi';
import i18n from '../i18n/i18n';
import { useErrorHandling } from '../composable/useErrorHandling';
import { AxiosError } from 'axios';

export const useStudyGroupStore = defineStore('studyGroup', () => {
  const { studyGroupsApi } = useStudyGroupsApi();
  const { handleIndividualError } = useErrorHandling();

  // State
  const studyGroups: Ref<StudyGroup[]> = ref([]);

  // Actions
  async function getStudyGroups(studyId: number) {
    if (!studyGroups.value.length) {
      studyGroups.value = await studyGroupsApi
        .listStudyGroups(studyId)
        .then((response) => response.data)
        .catch((e: AxiosError) => {
          handleIndividualError(e, 'cannot list study group');
          return studyGroups.value;
        });
    }
  }
  async function createStudyGroup(studyId: number) {
    let title;
    let count = studyGroups.value.length;
    while (title === undefined) {
      count += 1;
      // @ts-ignore
      const _title = `${i18n.global.t('study.props.studyGroup')} ${count}`;
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
        handleIndividualError(e, 'cannot create study group')
      );
  }

  function deleteStudyGroup(studyGroup: StudyGroup) {
    studyGroupsApi
      .deleteStudyGroup(
        studyGroup.studyId as number,
        studyGroup.studyGroupId as number
      )
      .then(() => {
        const position = studyGroups.value.findIndex(
          (studyGroupItem) =>
            studyGroupItem.studyGroupId === studyGroup.studyGroupId &&
            studyGroupItem.studyId === studyGroup.studyId
        );
        studyGroups.value.splice(position, 1);
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot delete study group')
      );
  }
  async function updateStudyGroup(studyGroup: StudyGroup) {
    const position = studyGroups.value.findIndex(
      (studyGroupsItem) =>
        studyGroupsItem.studyGroupId === studyGroup.studyGroupId
    );
    if (position > -1) {
      await studyGroupsApi
        .updateStudyGroup(
          studyGroup.studyId as number,
          studyGroup.studyGroupId as number,
          studyGroup
        )
        .then(() => studyGroups.value.splice(position, 1, studyGroup))
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot update study group')
        );
    }
  }
  return {
    studyGroups,
    getStudyGroups,
    createStudyGroup,
    deleteStudyGroup,
    updateStudyGroup,
  };
});

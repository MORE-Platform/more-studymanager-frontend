import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { StudyGroup } from '../generated-sources/openapi';
import { useStudyGroupsApi } from '../composable/useApi';
import i18n from '../i18n/i18n';

export const useStudyGroupStore = defineStore('studyGroup', () => {
  const { studyGroupsApi } = useStudyGroupsApi();

  // State
  const studyGroups: Ref<StudyGroup[]> = ref([]);

  // Actions
  async function getStudyGroups(studyId: number) {
    try {
      if (!studyGroups.value.length) {
        studyGroups.value = await studyGroupsApi
          .listStudyGroups(studyId)
          .then((response) => response.data);
      }
    } catch (e) {
      console.error('cannot list study groups', e);
    }
  }
  async function createStudyGroup(studyId: number) {
    function getTitle() {
      let title = undefined;
      let count = studyGroups.value.length;
      while (title === undefined) {
        count += 1;
        // @ts-ignore
        const _title = `${i18n.global.t('group')} ${count}`;
        if (!studyGroups.value.find((g) => g.title === _title)) {
          title = _title;
        }
      }
      return title;
    }
    try {
      await studyGroupsApi
        .createStudyGroup(studyId, {
          studyId,
          title: getTitle(),
        })
        .then((response) => studyGroups.value.push(response.data));
    } catch (e) {
      console.error('cannot create study group', e);
    }
  }

  function deleteStudyGroup(studyGroup: StudyGroup) {
    try {
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
        });
    } catch (e) {
      console.error('cannot delete study group', e);
    }
  }
  async function updateStudyGroup(studyGroup: StudyGroup) {
    try {
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
          .then(() => studyGroups.value.splice(position, 1, studyGroup));
      }
    } catch (e) {
      console.error('cannot update study group', e);
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

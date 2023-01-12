import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import {
  Study,
  StudyGroup,
  StudyRole,
  StudyStatus,
} from '../generated-sources/openapi';
import { useStudiesApi, useStudyGroupsApi } from '../composable/useApi';

export const useStudyStore = defineStore('study', () => {
  const { studiesApi } = useStudiesApi();
  const { studyGroupsApi } = useStudyGroupsApi();
  const studyGroups: Ref<StudyGroup[]> = ref([]);
  const study: Ref<Study> = ref({});
  async function getStudy(studyId: number): Promise<void> {
    if (!study.value.studyId) {
      study.value = await studiesApi
        .getStudy(studyId)
        .then((response) => response.data);

      console.log(study.value.studyId);
    }
  }
  async function getStudyGroups(studyId: number): Promise<void> {
    if (!studyGroups.value.length) {
      studyGroups.value = await studyGroupsApi
        .listStudyGroups(studyId)
        .then((response) => response.data);
    }
  }
  async function updateStudy(studyResponse: Study) {
    try {
      if (study.value.studyId) {
        study.value = await studiesApi
          .updateStudy(study.value.studyId, studyResponse)
          .then((response) => response.data);
      }
    } catch (e) {
      console.error("Couldn't update study " + study.value.studyId, e);
    }
  }

  async function updateStudyStatus(status: StudyStatus) {
    try {
      if (study.value.studyId) {
        studiesApi.setStatus(study.value.studyId, { status }).then(() => {
          study.value.status = status;
        });
      }
    } catch (e) {
      alert('Could not update study status');
      console.error('Could not update study status', e);
    }
  }
  const studyUserRoles: ComputedRef<Array<StudyRole>> = computed(() => [
    ...(study.value.userRoles || []),
  ]);

  return {
    study,
    studyGroups,
    getStudy,
    getStudyGroups,
    updateStudy,
    updateStudyStatus,
    studyUserRoles,
  };
});

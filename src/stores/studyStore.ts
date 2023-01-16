import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import {
  Study,
  StudyGroup,
  StudyRole,
  StudyStatus,
} from '../generated-sources/openapi';
import { useStudiesApi, useStudyGroupsApi } from '../composable/useApi';
import { AxiosResponse } from 'axios';

export const useStudyStore = defineStore('study', () => {
  const { studiesApi } = useStudiesApi();
  const { studyGroupsApi } = useStudyGroupsApi();

  // State
  const studyGroups: Ref<StudyGroup[]> = ref([]);
  const study: Ref<Study> = ref({});
  const studies: Ref<Study[]> = ref([]);

  // Actions
  async function getStudy(studyId: number): Promise<void> {
    if (!study.value.studyId || study.value.studyId !== studyId) {
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
  async function listStudies(): Promise<void> {
    try {
      studies.value = await studiesApi
        .listStudies()
        .then((response: AxiosResponse<Study[]>) => response.data);
    } catch (e) {
      console.error('cannot list studies', e);
    }
  }

  async function createStudy(study: Study): Promise<void> {
    await studiesApi.createStudy(study).then(listStudies);
  }

  async function deleteStudy(studyId: number | undefined) {
    if (studyId) {
      await studiesApi.deleteStudy(studyId).then(listStudies);
    }
  }
  async function updateStudyInStudies(changedStudy: Study) {
    const i = studies.value.findIndex(
      (studyItem) => studyItem.studyId === changedStudy.studyId
    );
    if (i > -1) {
      studies.value.splice(i, 1, changedStudy);
      await studiesApi.updateStudy(
        changedStudy.studyId as number,
        changedStudy
      );
    }
  }

  // Getters
  const studyUserRoles: ComputedRef<Array<StudyRole>> = computed(() => [
    ...(study.value.userRoles || []),
  ]);

  return {
    study,
    studyGroups,
    studies,
    getStudy,
    getStudyGroups,
    updateStudy,
    updateStudyStatus,
    listStudies,
    createStudy,
    deleteStudy,
    updateStudyInStudies,
    studyUserRoles,
  };
});

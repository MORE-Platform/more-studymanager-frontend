import { computed, ComputedRef, ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { Study, StudyRole, StudyStatus } from '../generated-sources/openapi';
import { useStudiesApi } from '../composable/useApi';
import { AxiosResponse } from 'axios';

export const useStudyStore = defineStore('study', () => {
  const { studiesApi } = useStudiesApi();

  // State
  const study: Ref<Study> = ref({});
  const studies: Ref<Study[]> = ref([]);

  // Actions
  async function getStudy(studyId: number): Promise<void> {
    try {
      study.value = await studiesApi
        .getStudy(studyId)
        .then((response) => response.data);
    } catch (e) {
      console.error('cannot fetch study', e);
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
        await studiesApi.setStatus(study.value.studyId, { status }).then(() => {
          study.value.status = status;
        });
      }
    } catch (e) {
      alert('Could not update study status');
      console.error('Could not update study status', e);
    }
  }

  async function createStudy(study: Study): Promise<void> {
    try {
      await studiesApi.createStudy(study).then((response) => {
        studies.value.push(response.data);
      });
    } catch (e) {
      console.error('cannot create study', e);
    }
  }

  async function deleteStudy(studyId: number | undefined) {
    try {
      if (studyId) {
        await studiesApi.deleteStudy(studyId).then(() => {
          const position = studies.value.findIndex(
            (studyItem) => studyItem.studyId === studyId
          );
          studies.value.splice(position, 1);
        });
      }
    } catch (e) {
      console.error('cannot delete study', e);
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
  async function updateStudyInStudies(changedStudy: Study) {
    try {
      const i = studies.value.findIndex(
        (studyItem) => studyItem.studyId === changedStudy.studyId
      );
      if (i > -1) {
        await studiesApi
          .updateStudy(changedStudy.studyId as number, changedStudy)
          .then(() => studies.value.splice(i, 1, changedStudy));
      }
    } catch (e) {
      console.error('cannot update study', e);
    }
  }
  // Getters
  const studyUserRoles: ComputedRef<Array<StudyRole>> = computed(() => [
    ...(study.value.userRoles || []),
  ]);

  return {
    study,
    studies,
    getStudy,
    updateStudy,
    updateStudyStatus,
    listStudies,
    createStudy,
    deleteStudy,
    updateStudyInStudies,
    studyUserRoles,
  };
});

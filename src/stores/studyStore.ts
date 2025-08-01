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
import { Study, StudyRole, StudyStatus } from '@gs';
import { useImportExportApi, useStudiesApi } from '../composable/useApi';
import { AxiosError, AxiosResponse } from 'axios';
import { useErrorHandling } from '../composable/useErrorHandling';
import { useStudyGroupStore } from './studyGroupStore';
import { DownloadData } from '../models/DataDownloadModel';
import { useToastService } from '../composable/toastService';

export const useStudyStore = defineStore('study', () => {
  const { studiesApi } = useStudiesApi();
  const { importExportApi } = useImportExportApi();
  const { handleIndividualError } = useErrorHandling();
  const studyGroupStore = useStudyGroupStore();
  const { handleToastErrors } = useToastService();
  // State
  const study: Ref<Study> = ref({});
  const studies: Ref<Study[]> = ref([]);

  // Actions
  async function getStudy(studyId: number): Promise<void> {
    study.value = await studiesApi
      .getStudy(studyId)
      .then((response) => response.data)
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot fetch study');
        return study.value;
      });
  }

  async function updateStudy(studyResponse: Study): Promise<void> {
    if (study.value.studyId) {
      study.value = await studiesApi
        .updateStudy(study.value.studyId, studyResponse)
        .then((response) => response.data)
        .catch((e: AxiosError) => {
          handleIndividualError(
            e,
            `cannot update study ${study.value.studyId}`,
          );
          return study.value;
        });
    }
  }

  async function updateStudyStatus(status: StudyStatus): Promise<void> {
    if (study.value.studyId) {
      await studiesApi
        .setStatus(study.value.studyId, { status })
        .then(() => {
          study.value.status = status;
        })
        .catch((e: AxiosError) => {
          handleIndividualError(
            e,
            `Could not update study status ${study.value.studyId}`,
          );
          handleToastErrors(e.response?.data);
        });
    }
  }

  async function createStudy(study: Study): Promise<void> {
    await studiesApi
      .createStudy(study)
      .then((response) => {
        studies.value.push(response.data);
        studyGroupStore.studyGroups = [];
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot create study'),
      );
  }

  async function deleteStudy(studyId: number | undefined): Promise<void> {
    if (studyId) {
      await studiesApi
        .deleteStudy(studyId)
        .then(() => {
          const position = studies.value.findIndex(
            (studyItem) => studyItem.studyId === studyId,
          );
          studies.value.splice(position, 1);
        })
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot delete study'),
        );
    }
  }

  async function listStudies(): Promise<void> {
    studies.value = await studiesApi
      .listStudies()
      .then((response: AxiosResponse<Study[]>) => response.data)
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list studies');
        return studies.value;
      });
  }

  async function updateStudyInStudies(changedStudy: Study): Promise<void> {
    const i = studies.value.findIndex(
      (studyItem) => studyItem.studyId === changedStudy.studyId,
    );
    if (i > -1) {
      await studiesApi
        .updateStudy(changedStudy.studyId as number, changedStudy)
        .then(() => studies.value.splice(i, 1, changedStudy))
        .catch((e: AxiosError) =>
          handleIndividualError(e, 'cannot update study in studies'),
        );
    }
  }

  const importStudy = (importedStudy: File): Promise<void> =>
    importExportApi
      .importStudy(importedStudy, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(listStudies);

  async function exportStudyConfig(studyId: number): Promise<void> {
    await importExportApi
      .exportStudy(studyId)
      .then((response: AxiosResponse) => {
        const filename: string = `study_config_${studyId}.json`;
        downloadJSON(filename, response.data);
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot export study config');
      });
  }

  async function exportStudyData({
    studyId,
    studyGroupId,
    participantId,
    observationId,
    from,
    to,
  }: DownloadData): Promise<void> {
    await importExportApi
      .generateDownloadToken(
        studyId,
        studyGroupId,
        participantId,
        observationId,
        from,
        to,
      )
      .then((rs) => {
        window.open(rs.headers.location);
      })
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          'cannot generate download token to export study data',
        );
      });
  }

  function downloadJSON(filename: string, file: File): void {
    const fileJSON = JSON.stringify(file);
    const link = document.createElement('a');
    if (link) {
      link.setAttribute(
        'href',
        `data:application/json; charset=utf-8,${encodeURIComponent(fileJSON)}`,
      );
      link.setAttribute('download', filename);
      link.style.display = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Getters
  const studyUserRoles: ComputedRef<Array<StudyRole>> = computed(() => [
    ...(study.value.userRoles || []),
  ]);
  const studyStatus: ComputedRef<StudyStatus> = computed(
    () => study.value.status || StudyStatus.Draft,
  );
  const studyId: ComputedRef<number> = computed(() => study.value.studyId || 0);

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
    importStudy,
    exportStudyConfig,
    exportStudyData,
    studyUserRoles,
    studyStatus,
    studyId,
  };
});

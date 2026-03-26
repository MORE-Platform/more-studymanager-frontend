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
import {
  AuditLogEntry,
  AuditLogMetadata,
  DataExportInner,
  ObservationTimelineEvent,
  OccurredObservation,
  Study,
  StudyRole,
  StudyStatus,
  StudyTimeline
} from '@gs';
import {
  useAuditLogApi,
  useCalendarApi,
  useImportExportApi,
  useOccurredObservationsApi,
  useStudiesApi
} from '../composable/useApi';
import { AxiosError, AxiosResponse } from 'axios';
import { useErrorHandling } from '../composable/useErrorHandling';
import { useStudyGroupStore } from './studyGroupStore';
import { useObservationGroupStore } from './observationGroupStore';
import { DownloadData } from '../models/DataDownloadModel';
import { useToastService } from '../composable/toastService';

const accessEditRoles: StudyRole[] = [
  StudyRole.StudyAdmin,
  StudyRole.StudyOperator,
];
const editableStatuses: StudyStatus[] = [
  StudyStatus.Draft,
  StudyStatus.Paused,
  StudyStatus.PausedPreview,
];

export const useStudyStore = defineStore('study', () => {
  const { studiesApi } = useStudiesApi();
  const { importExportApi } = useImportExportApi();
  const { auditLogApi } = useAuditLogApi();
  const { calendarApi } = useCalendarApi();
  const { occurredObservationsApi } = useOccurredObservationsApi();
  const { handleIndividualError } = useErrorHandling();
  const studyGroupStore = useStudyGroupStore();
  const observationGroupStore = useObservationGroupStore();
  const { handleToastErrors } = useToastService();
  // State
  const study: Ref<Study> = ref({});
  const studies: Ref<Study[]> = ref([]);
  const auditLogMetadata: Ref<AuditLogMetadata | undefined> = ref();
  const auditLogEntries: Ref<Array<AuditLogEntry>> = ref([]);
  const occurredObservations: Ref<Array<OccurredObservation>> = ref([]);
  const participantTimelineObservations: Ref<Array<ObservationTimelineEvent>> =
    ref([]);

  const studyIsUpdating = ref(false);

  // Getters
  const studyUserRoles: ComputedRef<Array<StudyRole>> = computed(() => [
    ...(study.value.userRoles || []),
  ]);
  const studyStatus: ComputedRef<StudyStatus> = computed(
    () => study.value.status || StudyStatus.Draft,
  );
  const studyId: ComputedRef<number> = computed(() => study.value.studyId || 0);
  const hasCriticalRoles = computed((): boolean =>
    studyUserRoles.value.some((role) => accessEditRoles.includes(role)),
  );

  const studyIsEditable = computed(
    (): boolean =>
      hasCriticalRoles.value && editableStatuses.includes(studyStatus.value),
  );
  // Actions
  async function getStudy(studyId: number): Promise<void> {
    study.value = await studiesApi
      .getStudy(studyId)
      .then((response) => {
        if (response.data?.studyId)
          observationGroupStore.getObservationGroups(response.data.studyId);
        return response.data;
      })
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
    if (!studyIsUpdating.value && study.value.studyId) {
      studyIsUpdating.value = true;
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
        })
        .finally(() => {
          studyIsUpdating.value = false;
        });
    }
  }

  async function createStudy(study: Study): Promise<void> {
    await studiesApi
      .createStudy(study)
      .then((response) => {
        studies.value.push(response.data);
        studyGroupStore.studyGroups = [];
        observationGroupStore.observationGroups = [];
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

  async function listOccurredObservations(
    studyId: number,
    participantId?: number,
    observationId?: number,
    from?: string,
    to?: string,
  ): Promise<void> {
    await occurredObservationsApi
      .listOccurredObservations(studyId, participantId, observationId, from, to)
      .then(
        (response: AxiosResponse) =>
          (occurredObservations.value = response.data),
      )
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `cannot get occuredObservation on study ${studyId} (participant: ${participantId}, observation: ${observationId}, from: ${from}, to: ${to})`,
        ),
      );
  }

  async function listParticipantObservationsInTimeline(
    studyId: number,
    participantId: number,
    studyGroup?: number,
    observationGroup?: number,
    referenceDate?: string,
    studyStartDate?: string,
    studyEndDate?: string,
  ): Promise<void> {
    await calendarApi
      .getStudyTimeline(
        studyId,
        participantId,
        studyGroup,
        observationGroup,
        referenceDate,
        studyStartDate,
        studyEndDate,
        undefined,
      )
      .then(
        (response: AxiosResponse<StudyTimeline>) =>
          (participantTimelineObservations.value =
            response.data?.observations ?? []),
      )
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `cannot get observations in timeline for study ${studyId}, participant ${participantId}`,
        ),
      );
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
    observationGroupId,
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
      .then(async (rs) => {
        if (rs && rs?.data?.token) {
          await importExportApi
            .exportStudyData(
              studyId,
              rs.data.token,
              studyGroupId,
              observationGroupId,
              participantId,
              observationId,
              from,
              to,
              { responseType: 'blob' },
            )
            .then((response) => {
              const blob = response.data as unknown as Blob;

              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `study_data_${studyId}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            })
            .catch((e: AxiosError) => {
              handleIndividualError(
                e,
                'cannot export data despite of existing download token',
              );
            });
        }
      })
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          'cannot generate download token to export study data',
        );
      });
  }

  async function exportAuditLog(studyId: number): Promise<void> {
    await auditLogApi
      .exportAuditLog(studyId)
      .then((response: AxiosResponse<AuditLogEntry[]>) => {
        window.open(response.headers.location);
        const filename: string = `study_auditlog_${studyId}.json`;
        downloadJSON(filename, response.data);
      })
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          'cannot generate download token to export study data',
        );
      });
  }

  function downloadJSON(
    filename: string,
    file: File | AuditLogEntry[] | DataExportInner[],
  ): void {
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

  async function getAuditLogMetadata(studyId: number): Promise<void> {
    auditLogMetadata.value = await auditLogApi
      .getAuditLogMetadata(studyId)
      .then((response: AxiosResponse) => response.data);
  }

  return {
    study,
    studies,
    getStudy,
    updateStudy,
    updateStudyStatus,
    listStudies,
    listOccurredObservations,
    occurredObservations,
    createStudy,
    deleteStudy,
    updateStudyInStudies,
    importStudy,
    exportStudyConfig,
    exportStudyData,
    studyUserRoles,
    studyStatus,
    studyId,
    studyIsEditable,
    studyIsUpdating,
    hasCriticalRoles,
    auditLogMetadata,
    auditLogEntries,
    getAuditLogMetadata,
    exportAuditLog,
    listParticipantObservationsInTimeline,
    participantTimelineObservations,
  };
});

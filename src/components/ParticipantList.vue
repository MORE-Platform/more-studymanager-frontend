/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useImportExportApi } from '@/composable/useApi';

  import {
    MoreParticipantListTableRow,
    MoreTableAction,
    MoreTableChoice,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
  } from '@/models/MoreTableModel';
  import {
    ObservationGroup,
    Participant,
    StudyGroup,
    StudyRole,
    StudyStatus,
  } from '@gs';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import useLoader from '../composable/useLoader';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '@/composable/useErrorHandling';
  import { useDialog } from 'primevue/usedialog';
  import DistributeParticipantsDialog from './dialog/DistributeParticipantsDialog.vue';
  import DeleteParticipantDialog from './dialog/DeleteParticipantDialog.vue';
  import Menu from 'primevue/menu';
  import Button from 'primevue/button';
  import FileUpload, { FileUploadUploaderEvent } from 'primevue/fileupload';
  import { MenuOptions } from '@/models/ComponentModels';
  import {
    ACTION_ID_DATA_HEALTH,
    ACTION_ID_DELETE,
    ACTION_ID_INFO,
    ACTION_ID_QR_CODE,
    PARTICIPANT_COUNTS,
  } from '@/constants';
  import QrCodeDialog from './dialog/QrCodeDialog.vue';
  import ParticipantDetailsDialog from './dialog/ParticipantDetailsDialog.vue';
  import ParticipantInfoDialog from './dialog/ParticipantInfoDialog.vue';
  import {
    useCreateParticipants,
    useDeleteParticipant as useDeleteParticipantMutation,
    useParticipants,
    useUpdateParticipant,
    useUpdateParticipantList,
  } from '../api/participantQueries';
  import { useStudyStore } from '@/stores/studyStore';
  import { useStudyGroupStore } from '@/stores/studyGroupStore';
  import { useObservationGroupStore } from '@/stores/observationGroupStore';

  const { importExportApi } = useImportExportApi();

  const loader = useLoader();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();
  const dialog = useDialog();
  const moreTableRef = ref();

  const studyStore = useStudyStore();
  const studyGroupsStore = useStudyGroupStore();
  const observationGroupStore = useObservationGroupStore();

  const sortOptions: MoreTableSortOptions = {
    sortField: 'alias',
    sortOrder: 1,
  };

  const groupStatuses: MoreTableChoice[] = studyGroupsStore.studyGroups.map(
    (studyGroup: StudyGroup) =>
      ({
        label: studyGroup.title,
        value: studyGroup.studyGroupId?.toString(),
      }) as MoreTableChoice,
  );
  groupStatuses.push({
    label: t('global.placeholder.noGroup'),
    value: null,
  } as MoreTableChoice);

  const observationGroupStatuses: MoreTableChoice[] =
    observationGroupStore.observationGroups.map(
      (observationGroup: ObservationGroup) =>
        ({
          label: observationGroup.title,
          value: observationGroup.observationGroupId?.toString(),
        }) as MoreTableChoice,
    );

  const participantsColumns: MoreTableColumn[] = [
    { field: 'participantId', header: t('global.labels.id'), sortable: true },
    {
      field: 'alias',
      header: t('participants.props.alias'),
      editable: true,
      sortable: true,
      filterable: true,
      columnWidth: '15vw',
    },
    { field: 'registrationToken', header: t('participants.props.token') },
    {
      field: 'status',
      header: t('study.props.status'),
      filterable: true,
    },
    {
      field: 'studyGroupId',
      header: t('study.props.studyGroup'),
      type: MoreTableFieldType.choice,
      editable: { enabled: studyStore.studyIsEditable, values: groupStatuses },
      sortable: true,
      filterable: true,
      placeholder: t('global.placeholder.noGroup'),
      columnWidth: '15vw',
    },
    {
      field: 'observationGroupValues',
      header: t('observationGroup.plural'),
      type: MoreTableFieldType.multiselect,
      arrayLabels: observationGroupStatuses,
      editable: {
        enabled: studyStore.studyIsEditable,
        values: observationGroupStatuses,
      },
      sortable: true,
      placeholder: t('global.placeholder.noGroup'),
      columnWidth: '10vw',
    },
    {
      field: 'start',
      header: t('participants.props.individualStart'),
      type: MoreTableFieldType.datetime,
      sortable: true,
      placeholder: '-',
      columnWidth: '10vw',
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: ACTION_ID_DATA_HEALTH,
      label: t('global.labels.dataHealth'),
      icon: 'pi pi-id-card',
      tooltip: t('tooltips.moreTable.openParticipantDetails'),
      visible: () => true,
    },
    {
      id: ACTION_ID_DELETE,
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteParticipantBtn'),
      visible: () => studyStore.studyIsEditable,
      confirmDeleteDialog: {
        header: t('participants.dialog.header.delete'),
        message: t('participants.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteParticipantDialog, {
            data: {
              introMsg: t('participants.dialog.deleteMsg.intro'),
              warningMsg: t('participants.dialog.deleteMsg.warning'),
              confirmMsg: t('participants.dialog.deleteMsg.confirm'),
              participant: row as Participant,
            },
            props: {
              header: t('participants.dialog.header.delete'),
              style: {
                width: '50vw',
              },
              breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
              },
              modal: true,
              draggable: false,
            },
            onClose: (options) => {
              if (options?.data) {
                onAction(
                  {
                    id: ACTION_ID_DELETE,
                    row: options.data.participant,
                  } as MoreTableRowActionResult,
                  options.data.withData,
                );
              }
            },
          }),
      },
    },
    {
      id: ACTION_ID_QR_CODE,
      label: t('global.labels.qr'),
      icon: 'pi pi-qrcode',
      tooltip: t('tooltips.moreTable.showQrCode'),
      visible: () => studyStore.studyStatus !== StudyStatus.Closed,
    },
  ];

  const endRowActions: MoreTableAction[] = [
    {
      id: ACTION_ID_INFO,
      label: t('global.labels.info'),
      icon: 'pi pi-chevron-right',
      tooltip: t('tooltips.moreTable.showParticipantInfo'),
      visible: () => true,
    },
  ];

  const addParticipantOptions: MenuOptions[] = PARTICIPANT_COUNTS.map(
    (count) => ({
      label: t(`participants.participantsList.labels.add${count}`),
      value: count,
      command: (): void => createParticipant(count),
    }),
  );

  const {
    data: participantsData,
    error: participantsError,
    refetch: refetchParticipants,
  } = useParticipants(() => studyStore.studyId);

  const { mutate: createParticipantsMutation } = useCreateParticipants();
  const { mutate: updateParticipantMutation } = useUpdateParticipant();
  const { mutate: deleteParticipantMutation } = useDeleteParticipantMutation();
  const { mutate: updateParticipantListMutation } = useUpdateParticipantList();

  const participantsList = computed((): MoreParticipantListTableRow[] => {
    const newData = participantsData.value;
    if (newData) {
      return newData.map((participant) => {
        return {
          ...participant,
          observationGroupValues: participant?.observationGroupIds?.map(
            (id: number) => getObservationGroupItem(id),
          ),
        } as MoreParticipantListTableRow;
      });
    } else {
      return [];
    }
  });

  watch(
    () => participantsError.value,
    (error) => {
      if (error) {
        handleIndividualError(error as AxiosError, 'cannot list participants');
      }
    },
  );

  function getObservationGroupItem(id: number): MoreTableChoice | undefined {
    return observationGroupStatuses?.find(
      (groupStatus) => groupStatus.value === id.toString(),
    );
  }

  function openDistributeDialog(): void {
    dialog.open(DistributeParticipantsDialog, {
      data: {
        studyGroups: studyGroupsStore.studyGroups,
        totalParticipants: participantsList.value.length,
      },
      props: {
        header: t('participants.dialog.header.distribute'),
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
      },
      onClose: (options) => {
        if (options?.data && options?.data === true) {
          distributeGroups();
        }
      },
    });
  }

  function distributeGroups(): void {
    // copy participants and shuffle list
    const participantCopy = shuffleArray(
      participantsList.value.map((p) => JSON.parse(JSON.stringify(p))),
    );
    // set group
    for (let i = 0; i < participantCopy.length; i++) {
      for (let j = 0; j < studyGroupsStore.studyGroups.length; j++) {
        if (i < participantCopy.length) {
          participantCopy[i].studyGroupId =
            studyGroupsStore.studyGroups[j].studyGroupId;
          if (j < studyGroupsStore.studyGroups.length - 1) i++;
        } else break;
      }
    }
    updateParticipantListMutation({
      studyId: studyStore.studyId,
      participants: participantCopy,
    });
  }

  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  function shuffleArray(a: Participant[]): Participant[] {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  function resolveParticipantSelection(
    selection: Participant | MoreParticipantListTableRow | number | string,
  ): Participant | MoreParticipantListTableRow | undefined {
    if (typeof selection === 'object' && selection !== null) {
      return selection as Participant | MoreParticipantListTableRow;
    }

    const participantId =
      typeof selection === 'string' ? parseInt(selection, 10) : selection;

    return participantsList.value.find(
      (participant) => participant.participantId === participantId,
    );
  }

  function openParticipantInfoDialog(
    selection: Participant | MoreParticipantListTableRow | number | string,
  ): void {
    const participant = resolveParticipantSelection(selection);

    if (!participant) {
      console.error('Could not resolve participant for dialog', selection);
      return;
    }

    dialog.open(ParticipantInfoDialog, {
      data: {
        participant,
      },
      props: {
        header: t('participants.dialog.header.details'),
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '80vw',
          '640px': '120vw',
        },
        modal: true,
        draggable: false,
        dismissableMask: true,
      },
      onClose: () => {
        refetchParticipants();
      },
    });
  }

  const onAction = (
    action: MoreTableRowActionResult,
    withData?: boolean,
  ): void => {
    switch (action.id) {
      case ACTION_ID_DELETE:
        deleteParticipant(action.row as Participant, !!withData);
        break;
      case ACTION_ID_QR_CODE:
        openQrCodeDialog(action.row as Participant);
        break;
      case ACTION_ID_DATA_HEALTH:
        openParticipantHealthDialog(action.row as Participant);
        break;
      case ACTION_ID_INFO:
        openParticipantInfoDialog(action.row as Participant);
        break;
      default:
        console.error('no handler for action', action);
    }
  };

  const openQrCodeDialog = (participant: Participant): void => {
    dialog.open(QrCodeDialog, {
      data: {
        participant,
      },
      props: {
        header: `${t('participants.dialog.header.qrCode')} ${participant.alias}`,
        style: {
          width: 'fit-content',
        },
        modal: true,
        draggable: false,
      },
    });
  };

  const openParticipantHealthDialog = (participant: Participant): void => {
    dialog.open(ParticipantDetailsDialog, {
      data: {
        participant,
        studyId: studyStore.studyId,
      },
      props: {
        header: `${t('participants.dialog.header.details')}: ${participant.alias}`,
        style: {
          width: '50vw',
          maxHeight: '92vh',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
        closeOnEscape: false,
      },
    });
  };

  const createParticipant = (amount: number): void => {
    const newParticipants: Participant[] = [];
    const maxId = Math.max(
      0,
      ...participantsList.value.map((p) => p?.participantId || 0),
    );

    for (let i = 1; i <= amount; i++) {
      newParticipants.push({
        alias: `P ${maxId + i}`,
        studyId: studyStore.studyId,
      });
    }

    createParticipantsMutation({
      studyId: studyStore.studyId,
      participants: newParticipants,
    });
  };

  function changeValue(participant: MoreParticipantListTableRow): void {
    const i = participantsList.value.findIndex(
      (v) => v.participantId === participant.participantId,
    );
    if (i > -1) {
      participantsList.value[i] = participant;
      const { observationGroupValues, ...newParticipant } = participant;

      updateParticipantMutation({
        studyId: participant.studyId as number,
        participantId: participant.participantId as number,
        participant: {
          ...newParticipant,
          observationGroupIds:
            observationGroupValues?.map((choice: MoreTableChoice) =>
              parseInt(choice.value as string),
            ) ?? [],
        },
      });
    }
  }

  async function deleteParticipant(
    participant: Participant,
    withData: boolean,
  ): Promise<void> {
    deleteParticipantMutation({
      studyId: participant.studyId as number,
      participantId: participant.participantId as number,
      includeData: withData,
    });
  }

  async function importParticipants(
    event: FileUploadUploaderEvent,
  ): Promise<void> {
    const file: File = Array.isArray(event.files)
      ? event.files[0]
      : event.files;

    await importExportApi
      .importParticipants(studyStore.studyId, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        setTimeout(function () {
          refetchParticipants();
        }, 100);
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, `Couldn't upload file`),
      );
  }

  async function exportParticipants(): Promise<void> {
    await importExportApi
      .exportParticipants(studyStore.studyId)
      .then((response: AxiosResponse) => {
        const filename: string = studyStore.studyId + '_participants';
        downloadCSV(filename, response.data);
      });
  }

  function downloadCSV(filename: string, file: File): void {
    const blob = new Blob([file], { type: 'text/csv; charset=utf-8;' });
    const link = document.createElement('a');
    if (link) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  const menu = ref();

  function toggleButtonMenu(event: MouseEvent): void {
    menu.value.toggle(event);
  }
</script>

<template>
  <div class="participant-list">
    <MoreTable
      v-if="!!observationGroupStatuses"
      ref="moreTableRef"
      row-id="participantId"
      :sort-options="sortOptions"
      :title="$t('participants.participantsList.title')"
      :subtitle="$t('participants.participantsList.description')"
      :columns="participantsColumns"
      :rows="participantsList"
      :row-actions="rowActions"
      :end-row-actions="endRowActions"
      :row-edit-btn="studyStore.hasCriticalRoles"
      :loading="loader.isLoading.value"
      :editable-access="studyStore.studyStatus !== StudyStatus.Closed"
      :editable="() => studyStore.studyIsEditable"
      :editable-user-roles="[StudyRole.StudyAdmin, StudyRole.StudyOperator]"
      :empty-message="$t('participants.participantsList.emptyListMsg')"
      class="width-50"
      @on-action="onAction($event)"
      @on-change="changeValue($event)"
      @on-select="openParticipantInfoDialog($event as Participant)"
    >
      <template #tableActions="{ isInEditMode }">
        <div>
          <Button
            type="button"
            :disabled="!!isInEditMode || !studyStore.studyIsEditable"
            @click="toggleButtonMenu($event)"
            >{{ t('participants.participantsList.action.add') }}
            <span class="pi pi-angle-down ml-3"></span
          ></Button>
          <Menu ref="menu" :model="addParticipantOptions" :popup="true" />
        </div>
        <div class="ml-2.5">
          <Button
            type="button"
            :label="t('participants.participantsList.action.distribute')"
            :disabled="
              !!isInEditMode ||
              !studyStore.studyIsEditable ||
              participantsList.length === 0
            "
            @click="openDistributeDialog()"
          />
        </div>
        <div class="ml-2.5">
          <FileUpload
            class="cursor-pointer"
            mode="basic"
            upload-icon="pi pi-upload"
            :choose-label="t('participants.participantsList.action.import')"
            :custom-upload="true"
            :auto="true"
            accept=".csv"
            :disabled="!!isInEditMode || !studyStore.studyIsEditable"
            @uploader="importParticipants($event)"
          ></FileUpload>
        </div>
        <div class="ml-2.5">
          <Button
            type="button"
            icon="pi pi-download"
            :label="t('participants.participantsList.action.export')"
            :disabled="!!isInEditMode || participantsList.length === 0"
            @click="exportParticipants()"
          />
        </div>
      </template>
    </MoreTable>
    <ConfirmDialog />
    <DynamicDialog />
  </div>
</template>

<style scoped>
  :deep(.width-50 .title) {
    width: 50%;
  }
</style>

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { PropType, ref, Ref } from 'vue';
  import { useImportExportApi, useParticipantsApi } from '../composable/useApi';

  import {
    MoreTableAction,
    MoreTableChoice,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
  } from '../models/MoreTableModel';
  import {
    Participant,
    StudyGroup,
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import * as starWarsNames from 'starwars-names';
  import useLoader from '../composable/useLoader';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { useDialog } from 'primevue/usedialog';
  import DistributeParticipantsDialog from './dialog/DistributeParticipantsDialog.vue';
  import DeleteParticipantDialog from './dialog/DeleteParticipantDialog.vue';
  import Menu from 'primevue/menu';
  import Button from 'primevue/button';
  import FileUpload, { FileUploadUploaderEvent } from 'primevue/fileupload';
  import { MenuOptions } from '../models/ComponentModels';

  const { participantsApi } = useParticipantsApi();
  const { importExportApi } = useImportExportApi();
  const participantsList: Ref<Participant[]> = ref([]);
  const loader = useLoader();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();
  const dialog = useDialog();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    studyStatus: {
      type: String as PropType<StudyStatus>,
      required: true,
    },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
  });

  const sortOptions: MoreTableSortOptions = {
    sortField: 'alias',
    sortOrder: 1,
  };

  const actionsVisible =
    props.studyStatus === StudyStatus.Draft ||
    props.studyStatus === StudyStatus.Paused ||
    props.studyStatus === StudyStatus.PausedPreview;

  const groupStatuses: MoreTableChoice[] = props.studyGroups.map(
    (studyGroup) =>
      ({
        label: studyGroup.title,
        value: studyGroup.studyGroupId?.toString(),
      }) as MoreTableChoice,
  );
  groupStatuses.push({
    label: t('global.placeholder.noGroup'),
    value: null,
  } as MoreTableChoice);

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
      editable: { enabled: actionsVisible, values: groupStatuses },
      sortable: true,
      filterable: true,
      placeholder: t('global.placeholder.noGroup'),
      columnWidth: '15vw',
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
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteParticipantBtn'),
      visible: () => actionsVisible,
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
                executeAction(
                  {
                    id: 'delete',
                    row: options.data.participant,
                  } as MoreTableRowActionResult,
                  options.data.withData,
                );
              }
            },
          }),
      },
    },
  ];

  const addParticipantOptions: MenuOptions[] = [
    {
      label: t('participants.participantsList.labels.add1'),
      value: 1,
      command: (): void => createParticipant(1),
    },
    {
      label: t('participants.participantsList.labels.add3'),
      value: 3,
      command: (): void => createParticipant(3),
    },
    {
      label: t('participants.participantsList.labels.add10'),
      value: 10,
      command: (): void => createParticipant(10),
    },
    {
      label: t('participants.participantsList.labels.add25'),
      value: 25,
      command: (): void => createParticipant(25),
    },
    {
      label: t('participants.participantsList.labels.add50'),
      value: 50,
      command: (): void => createParticipant(50),
    },
  ];

  async function listParticipant(): Promise<void> {
    participantsList.value = await participantsApi
      .listParticipants(props.studyId)
      .then((response) => response.data)
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participants');
        return participantsList.value;
      });
  }

  function openDistributeDialog(): void {
    dialog.open(DistributeParticipantsDialog, {
      data: {
        studyGroups: props.studyGroups,
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
      for (let j = 0; j < props.studyGroups.length; j++) {
        if (i < participantCopy.length) {
          participantCopy[i].studyGroupId = props.studyGroups[j].studyGroupId;
          if (j < props.studyGroups.length - 1) i++;
        } else break;
      }
    }
    participantsApi
      .updateParticipantList(props.studyId, participantCopy)
      .then((response) => response.data)
      .then((ps) => (participantsList.value = ps));
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

  function executeAction(
    action: MoreTableRowActionResult,
    withData?: boolean,
  ): void {
    switch (action.id) {
      case 'delete':
        deleteParticipant(action.row as Participant, !!withData);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  function createParticipant(amount: number): void {
    const i = amount || 1;
    const participants = starWarsNames
      .random(i)
      .map((alias: string) => ({ alias, studyId: props.studyId }));
    participantsApi
      .createParticipants(props.studyId, participants)
      .then(listParticipant);
  }

  function changeValue(participant: Participant): void {
    const i = participantsList.value.findIndex(
      (v) => v.participantId === participant.participantId,
    );
    if (i > -1) {
      participantsList.value[i] = participant;
      participantsApi.updateParticipant(
        participant.studyId as number,
        participant.participantId as number,
        participant,
      );
    }
  }

  async function deleteParticipant(
    participant: Participant,
    withData: boolean,
  ): Promise<void> {
    participantsApi
      .deleteParticipant(
        participant.studyId as number,
        participant.participantId as number,
        withData,
      )
      .then(listParticipant);
  }

  async function importParticipants(
    event: FileUploadUploaderEvent,
  ): Promise<void> {
    const file: File = Array.isArray(event.files)
      ? event.files[0]
      : event.files;

    await importExportApi
      .importParticipants(props.studyId, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        setTimeout(function () {
          listParticipant();
        }, 100);
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, `Couldn't upload file`),
      );
  }

  async function exportParticipants(): Promise<void> {
    await importExportApi
      .exportParticipants(props.studyId)
      .then((response: AxiosResponse) => {
        const filename: string = props.studyId + '_participants';
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

  function checkEditablePermissions(row: any): boolean {
    if (
      props.studyStatus === StudyStatus.Active ||
      props.studyStatus === StudyStatus.Preview
    ) {
      return row.status === 'new';
    }
    return props.studyStatus !== StudyStatus.Closed;
  }

  const menu = ref();

  function toggleButtonMenu(event: MouseEvent): void {
    menu.value.toggle(event);
  }

  listParticipant();
</script>

<template>
  <div class="participant-list">
    <MoreTable
      row-id="participantId"
      :sort-options="sortOptions"
      :title="$t('participants.participantsList.title')"
      :subtitle="$t('participants.participantsList.description')"
      :columns="participantsColumns"
      :rows="participantsList"
      :row-actions="rowActions"
      :loading="loader.isLoading.value"
      :editable-access="props.studyStatus !== StudyStatus.Closed"
      :editable="checkEditablePermissions"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('participants.participantsList.emptyListMsg')"
      class="width-50"
      @on-action="executeAction($event)"
      @on-change="changeValue($event)"
    >
      <template #tableActions="{ isInEditMode }">
        <div>
          <Button
            type="button"
            :disabled="isInEditMode ? true : !actionsVisible"
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
              isInEditMode
                ? true
                : !actionsVisible || participantsList.length === 0
            "
            @click="openDistributeDialog()"
          />
        </div>
        <div class="ml-2.5">
          <FileUpload
            mode="basic"
            upload-icon="pi pi-upload"
            :choose-label="t('participants.participantsList.action.import')"
            :custom-upload="true"
            :auto="true"
            accept=".csv"
            :disabled="isInEditMode ? true : !actionsVisible"
            @uploader="importParticipants($event)"
          ></FileUpload>
        </div>
        <div class="ml-2.5">
          <Button
            type="button"
            icon="pi pi-download"
            :label="t('participants.participantsList.action.export')"
            :disabled="isInEditMode ? true : participantsList.length === 0"
            @click="exportParticipants()"
          />
        </div>
      </template>
    </MoreTable>
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style scoped lang="postcss">
  :deep(.width-50 .title) {
    width: 50%;
  }
</style>

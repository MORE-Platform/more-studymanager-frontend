<script setup lang="ts">
  import { PropType, ref, Ref } from 'vue';
  import { useImportExportApi, useParticipantsApi } from '../composable/useApi';

  import {
    FileUploadModeType,
    MoreTableAction,
    MoreTableActionResult,
    MoreTableChoice,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
  } from '../models/MoreTableModel';
  import {
    Participant,
    StudyGroup,
    StudyStatus,
    StudyRole,
  } from '../generated-sources/openapi';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import * as names from 'starwars-names';
  import useLoader from '../composable/useLoader';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { useDialog } from 'primevue/usedialog';
  import DistributeParticipantsDialog from './dialog/DistributeParticipantsDialog.vue';
  import DeleteParticipantDialog from './dialog/DeleteParticipantDialog.vue';

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
    statusStatus: {
      type: String as PropType<StudyStatus>,
      required: true,
    },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
  });

  const actionsVisible =
    props.statusStatus === StudyStatus.Draft ||
    props.statusStatus === StudyStatus.Paused;

  const groupStatuses: Ref<MoreTableChoice[]> = ref(
    props.studyGroups.map(
      (item) =>
        ({
          label: item.title,
          value: item.studyGroupId?.toString(),
        } as MoreTableChoice)
    )
  );
  groupStatuses.value.push({
    label: t('global.placeholder.noGroup'),
    value: null,
  });

  const participantsColumns: MoreTableColumn[] = [
    { field: 'participantId', header: t('global.labels.id'), sortable: true },
    {
      field: 'alias',
      header: t('participants.props.alias'),
      editable: true,
      sortable: true,
      filterable: { showFilterMatchModes: false },
      columnWidth: '15vw',
    },
    { field: 'registrationToken', header: t('participants.props.token') },
    {
      field: 'status',
      header: t('study.props.status'),
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'studyGroupId',
      header: t('study.props.studyGroup'),
      type: MoreTableFieldType.choice,
      editable: { values: groupStatuses.value },
      sortable: true,
      filterable: { showFilterMatchModes: false },
      placeholder: t('global.placeholder.noGroup'),
      columnWidth: '15vw',
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
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
                execute(
                  {
                    id: 'delete',
                    row: options.data.participant as Participant,
                  },
                  options.data.withData
                );
              }
            },
          }),
      },
    },
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'distribute',
      label: t('participants.participantsList.action.distribute'),
      visible: () => {
        return actionsVisible && participantsList.value.length > 0;
      },
    },
    {
      id: 'import',
      label: t('participants.participantsList.action.import'),
      visible: () => {
        return actionsVisible;
      },
      options: {
        type: 'fileUpload',
        values: [],
        uploadOptions: {
          mode: FileUploadModeType.basic,
        },
      },
    },
    {
      id: 'export',
      label: t('participants.participantsList.action.export'),
      icon: 'pi pi-download',
      visible: () => {
        return participantsList.value.length > 0;
      },
    },
    {
      id: 'create',
      label: t('participants.participantsList.action.add'),
      icon: 'pi pi-angle-down',
      visible: () => {
        return (
          props.statusStatus === StudyStatus.Draft ||
          props.statusStatus === StudyStatus.Paused
        );
      },

      options: {
        type: 'menu',
        values: [
          { label: t('participants.participantsList.labels.add1'), value: 1 },
          { label: t('participants.participantsList.labels.add3'), value: 3 },
          { label: t('participants.participantsList.labels.add10'), value: 10 },
          { label: t('participants.participantsList.labels.add25'), value: 25 },
          { label: t('participants.participantsList.labels.add50'), value: 50 },
        ],
      },
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

  function openDistrubuteDialog(): void {
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
      participantsList.value.map((p) => JSON.parse(JSON.stringify(p)))
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
  function shuffleArray(a: Participant[]) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  function execute(
    action: MoreTableRowActionResult<Participant> | MoreTableActionResult,
    withData?: boolean
  ) {
    switch (action.id) {
      case 'delete':
        return deleteParticipant(
          (action as MoreTableRowActionResult<Participant>).row,
          !!withData
        );
      case 'create':
        return createParticipant(action as MoreTableActionResult);
      case 'distribute':
        return openDistrubuteDialog();
      case 'import':
        return importParticipants(action);
      case 'export':
        return exportParticipants();
      default:
        console.error('no handler for action', action);
    }
  }

  function createParticipant(actionResult: MoreTableActionResult) {
    const i = actionResult.properties || 1;
    const participants = names
      .random(i)
      .map((alias: string) => ({ alias, studyId: props.studyId }));
    participantsApi
      .createParticipants(props.studyId, participants)
      .then(listParticipant);
  }

  function changeValue(participant: Participant) {
    const i = participantsList.value.findIndex(
      (v) => v.participantId === participant.participantId
    );
    if (i > -1) {
      participantsList.value[i] = participant;
      participantsApi.updateParticipant(
        participant.studyId as number,
        participant.participantId as number,
        participant
      );
    }
  }

  async function deleteParticipant(
    participant: Participant,
    withData: boolean
  ) {
    participantsApi
      .deleteParticipant(
        participant.studyId as number,
        participant.participantId as number,
        withData
      )
      .then(listParticipant);
  }

  async function importParticipants(
    action: MoreTableActionResult
  ): Promise<void> {
    if (action.properties?.files) {
      const file = action.properties?.files[0];
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
        });
    }
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

  listParticipant();
</script>

<template>
  <div class="participant-list">
    <MoreTable
      row-id="participantId"
      :sort-options="{ sortField: 'alias', sortOrder: 1 }"
      :title="$t('participants.participantsList.title')"
      :subtitle="$t('participants.participantsList.description')"
      :columns="participantsColumns"
      :rows="participantsList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :loading="loader.isLoading.value"
      :editable-access="actionsVisible"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('participants.participantsList.emptyListMsg')"
      class="width-65"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style scoped lang="postcss">
  .table-value-status-new {
    display: block;
    margin: 0.063rem 0.188rem 0 0;
    position: relative;
  }
  :deep(.width-65 .title) {
    width: 65%;
  }
</style>

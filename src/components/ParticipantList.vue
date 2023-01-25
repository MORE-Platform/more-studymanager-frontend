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
  import * as names from 'starwars-names';
  import useLoader from '../composable/useLoader';
  import { AxiosResponse } from 'axios';
  import { useI18n } from 'vue-i18n';

  const { participantsApi } = useParticipantsApi();
  const { importExportApi } = useImportExportApi();
  const participantsList: Ref<Participant[]> = ref([]);
  const loader = useLoader();
  const { t } = useI18n();

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
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      visible: () => actionsVisible,
      confirm: {
        header: t('participants.dialog.header.delete'),
        message: t('participants.dialog.msg.delete'),
      },
    },
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'distribute',
      label: t('participants.participantsList.action.distribute'),
      visible: () => {
        return actionsVisible;
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
      visible: () => {
        return participantsList.value.length > 0;
      },
    },
    {
      id: 'create',
      label: t('participants.participantsList.action.add'),
      icon: 'pi pi-plus',
      visible: () => {
        return (
          props.statusStatus === StudyStatus.Draft ||
          props.statusStatus === StudyStatus.Paused
        );
      },
      options: {
        type: 'split',
        values: [
          { label: t('participants.participantsList.labels.add3'), value: 3 },
          { label: t('participants.participantsList.labels.add10'), value: 10 },
          { label: t('participants.participantsList.labels.add25'), value: 25 },
          { label: t('participants.participantsList.labels.add50'), value: 50 },
        ],
      },
    },
  ];

  async function listParticipant(): Promise<void> {
    loader.enable();
    try {
      participantsList.value = await participantsApi
        .listParticipants(props.studyId)
        .then((response) => response.data);
    } catch (e) {
      console.error('cannot list participants', e);
    } finally {
      loader.disable();
    }
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
    action: MoreTableRowActionResult<Participant> | MoreTableActionResult
  ) {
    switch (action.id) {
      case 'delete':
        return deleteParticipant(
          (action as MoreTableRowActionResult<Participant>).row
        );
      case 'create':
        return createParticipant(action as MoreTableActionResult);
      case 'distribute':
        return distributeGroups();
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

  function deleteParticipant(participant: Participant) {
    participantsApi
      .deleteParticipant(
        participant.studyId as number,
        participant.participantId as number
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
      :loading="loader.loading.value"
      :editable-access="actionsVisible"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('participants.participantsList.emptyListMsg')"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<style scoped lang="postcss">
  /* participant status styling template*/
  .table-value-status-new {
    display: block;
    margin: 0.063rem 0.188rem 0 0;
    /*padding-left: 1.2rem;
    color: var(--primary-color);*/
    position: relative;

    /*&:before {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    content: "";
    display: inline-block;
    width: 0.938rem;
    height: 0.938rem;
    margin-right: 0.313rem;
    background: var(--primary-color);
  } */
  }
</style>

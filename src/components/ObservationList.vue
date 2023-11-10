<script setup lang="ts">
  import { PropType, Ref, ref } from 'vue';
  import { useComponentsApi, useObservationsApi } from '../composable/useApi';
  import {
    ComponentFactory,
    Observation,
    StudyGroup,
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import {
    MoreTableAction,
    MoreTableActionOption,
    MoreTableChoice,
    MoreTableCollaboratorItem,
    MoreTableColumn,
    MoreTableFieldType,
  } from '../models/MoreTableModel';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useDialog } from 'primevue/usedialog';
  import ObservationDialog from '../components/dialog/ObservationDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useStudyStore } from '../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';

  const loader = useLoader();
  const { observationsApi } = useObservationsApi();
  const { componentsApi } = useComponentsApi();
  const studyStore = useStudyStore();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();

  const observationList: Ref<Observation[]> = ref([]);
  const dialog = useDialog();
  //const loading = ref(true)
  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
    studyStatus: { type: String as PropType<StudyStatus>, required: true },
  });

  const actionsVisible =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused;

  const groupStatuses = props.studyGroups.map(
    (item) =>
      ({
        label: item.title,
        value: item.studyGroupId?.toString(),
      } as MoreTableChoice)
  );
  groupStatuses.push({
    label: t('global.placeholder.entireStudy'),
    value: null,
  });

  async function getFactories() {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }

  const factories: ComponentFactory[] = await getFactories();
  const observationTypes: MoreTableActionOption[] = factories.map(
    (item: any) => ({
      label: t(item.title),
      value: item.componentId,
      description: t(item.description),
    })
  );

  const observationColumns: MoreTableColumn[] = [
    {
      field: 'typeLabel',
      header: t('observation.props.type'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
      columnWidth: '5vw',
    },
    {
      field: 'title',
      header: t('study.props.title'),
      editable: true,
      sortable: true,
      filterable: { showFilterMatchModes: false },
      columnWidth: '10vw',
    },
    {
      field: 'purpose',
      header: t('study.props.purpose'),
      editable: true,
      type: MoreTableFieldType.longtext,
      columnWidth: '10vw',
    },
    {
      field: 'studyGroupId',
      header: t('study.props.studyGroup'),
      type: MoreTableFieldType.choice,
      editable: { values: groupStatuses },
      sortable: true,
      filterable: { showFilterMatchModes: false },
      placeholder: t('global.placeholder.entireStudy'),
      columnWidth: '5vw',
    },
    {
      field: 'hidden',
      header: t('observation.props.hidden.true'),
      type: MoreTableFieldType.showIcon,
      sortable: true,
      columnWidth: '3vw',
      editable: true,
    },
    /*
    {
      field: 'schedule.dtstart',
      header: t('global.labels.start'),
      type: MoreTableFieldType.nestedDatetime,
      columnWidth: '3vw',
      sortable: true,
    },
    {
      field: 'schedule.dtend',
      header: t('global.labels.end'),
      type: MoreTableFieldType.nestedDatetime,
      columnWidth: '3vw',
      sortable: true,
    }, */
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      icon: 'pi pi-angle-down',
      label: t('observation.observationList.action.add'),
      visible: () => actionsVisible,
      options: { type: 'menu', values: observationTypes },
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'clone',
      label: t('global.labels.clone'),
      visible: () => actionsVisible,
    },
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      visible: () => actionsVisible,
      confirmDeleteDialog: {
        header: t('observation.dialog.header.delete'),
        message: t('observation.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('observation.dialog.deleteMsg.intro'),
              warningMsg: t('observation.dialog.deleteMsg.warning'),
              confirmMsg: t('observation.dialog.deleteMsg.confirm'),
              row: row,
              elTitle: getObservationTypeString(row.type)
                ? row.title + ' (' + getObservationTypeString(row.type) + ')'
                : row.title,
              elInfoTitle: t('study.props.purpose'),
              elInfoDesc: row.purpose,
            },
            props: {
              header: t('observation.dialog.header.delete'),
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
                execute({
                  id: 'delete',
                  row: options.data as MoreTableCollaboratorItem,
                });
              }
            },
          }),
      },
    },
  ];

  const rowEndActions: MoreTableAction[] = [
    {
      id: 'edit',
      label: t('global.labels.edit'),
      icon: 'pi pi-cog',
    },
  ];

  function getObservationTypeString(observationType: string) {
    return t(
      factories.find((item) => item.componentId === observationType)
        ?.title as string
    );
  }

  async function listObservations(): Promise<void> {
    observationList.value = await observationsApi
      .listObservations(props.studyId)
      .then((response: AxiosResponse) => {
        return response.data.map((item: Observation) => {
          return {
            studyId: item.studyId,
            observationId: item.observationId,
            studyGroupId: item.studyGroupId,
            title: item.title,
            purpose: item.purpose,
            participantInfo: item.participantInfo,
            type: item.type,
            typeLabel: getObservationTypeString(item.type as string),
            properties: item.properties,
            schedule: item.schedule,
            created: item.created,
            modified: item.modified,
            hidden: item.hidden,
            noSchedule: item.noSchedule,
          };
        });
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot list observations')
      );
  }

  function execute(action: any) {
    switch (action.id) {
      case 'delete':
        return deleteObservation(action.row);
      case 'create':
        return openObservationDialog(t('observation.dialog.header.create'), {
          type: action.properties,
        });
      case 'clone':
        return openObservationDialog(
          t('observation.dialog.header.clone'),
          action.row,
          'clone'
        );
      case 'edit':
        return openEditObservation(action.row.observationId);
      default:
        console.error('no handler for action', action);
    }
  }

  async function updateObservation(observation: Observation) {
    //do change immediately (ux)
    const i = observationList.value.findIndex(
      (o: Observation) => o.observationId === observation.observationId
    );
    if (i > -1) {
      observationList.value[i] = observation;
    }

    await observationsApi
      .updateObservation(
        props.studyId,
        observation.observationId as number,
        observation
      )
      .then(listObservations)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          "Couldn't update opservation " + observation.title
        )
      );
  }

  async function deleteObservation(requestObservation: Observation) {
    await observationsApi
      .deleteObservation(
        props.studyId,
        requestObservation.observationId as number
      )
      .then(listObservations)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          'Cannot delete observation ' + requestObservation.observationId
        )
      );
  }

  function factoryForType(type?: string) {
    return factories.find((f) => f.componentId === type);
  }

  function openObservationDialog(
    headerText: string,
    observation?: Observation,
    typeText?: string
  ) {
    dialog.open(ObservationDialog, {
      data: {
        groupStates: groupStatuses,
        observation: observation,
        factory: factoryForType(observation?.type),
        closeWithEscape: false,
      },
      props: {
        header: headerText,
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
      onClose: (options) => {
        if (options?.data) {
          if (options.data?.observationId) {
            if (typeText) {
              createObservation(options.data as Observation);
            } else {
              updateObservation(options.data as Observation);
            }
          } else {
            createObservation(options.data as Observation);
          }
        }
      },
    });
  }

  function createObservation(newObservation: Observation) {
    observationsApi
      .addObservation(props.studyId, newObservation)
      .then(listObservations)
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'Cannot create observation')
      );
  }

  function openEditObservation(observationId: number) {
    const observation = observationList.value.find(
      (o) => o.observationId === observationId
    );
    if (observation) {
      let dialogTitle = t('observation.dialog.header.edit');
      if (
        props.studyStatus === StudyStatus.Active ||
        props.studyStatus === StudyStatus.Closed
      ) {
        dialogTitle = t('observation.dialog.header.view');
      }
      openObservationDialog(dialogTitle, observation);
    }
  }
  listObservations();
</script>

<template>
  <div class="observation-list">
    <MoreTable
      row-id="observationId"
      :title="$t('observation.observationList.title')"
      :subtitle="$t('observation.observationList.description')"
      :columns="observationColumns"
      :rows="observationList"
      :row-actions="rowActions"
      :row-end-actions="rowEndActions"
      :table-actions="tableActions"
      :sort-options="{ sortField: 'title', sortOrder: -1 }"
      :editable-access="actionsVisible"
      :loading="loader.isLoading.value"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('observation.observationList.emptyListMsg')"
      :component-factory="factories"
      class="table-title-width"
      @onselect="openEditObservation($event)"
      @onaction="execute($event)"
      @onchange="updateObservation($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style scoped lang="postcss">
  :deep(.table-title-width) {
    .title {
      max-width: 80%;
    }
  }
</style>

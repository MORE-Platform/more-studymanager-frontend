<script setup lang="ts">
  import { ref, Ref, PropType } from 'vue';
  import { useObservationsApi, useComponentsApi } from '../composable/useApi';
  import {
    ComponentFactory,
    Observation,
    StudyGroup,
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableChoice,
    MoreTableActionOption,
  } from '../models/MoreTableModel';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { AxiosResponse } from 'axios';
  import { useDialog } from 'primevue/usedialog';
  import ObservationDialog from '../components/dialog/ObservationDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useStudyStore } from '../stores/studyStore';
  import { useI18n } from 'vue-i18n';

  const loader = useLoader();
  const { observationsApi } = useObservationsApi();
  const { componentsApi } = useComponentsApi();
  const studyStore = useStudyStore();
  const { t } = useI18n();

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
      label: item.title,
      value: item.componentId,
      description: item.description,
    })
  );

  const observationColumns: MoreTableColumn[] = [
    {
      field: 'type',
      header: t('observation.props.type'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'title',
      header: t('study.props.title'),
      editable: true,
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'purpose',
      header: t('study.props.purpose'),
      editable: true,
      type: MoreTableFieldType.longtext,
    },
    {
      field: 'studyGroupId',
      header: t('study.props.studyGroup'),
      type: MoreTableFieldType.choice,
      editable: { values: groupStatuses },
      sortable: true,
      filterable: { showFilterMatchModes: false },
      placeholder: t('global.placeholder.entireStudy'),
    },
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      icon: 'pi pi-plus',
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
      confirm: {
        header: t('observation.dialog.header.delete'),
        message: t('observation.dialog.msg.delete'),
      },
    },
  ];

  async function listObservations(): Promise<void> {
    try {
      loader.enable();
      observationList.value = await observationsApi
        .listObservations(props.studyId)
        .then((response: AxiosResponse) => response.data)
        .finally(loader.disable);
    } catch (e) {
      console.error('cannot list studies', e);
      loader.reset();
    }
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
      default:
        console.error('no handler for action', action);
    }
  }

  async function updateObservation(observation: Observation) {
    try {
      //do change immediately (ux)
      const i = observationList.value.findIndex(
        (o: Observation) => o.observationId === observation.observationId
      );
      if (i > -1) {
        observationList.value[i] = observation;
      }
      loader.enable();
      await observationsApi
        .updateObservation(
          props.studyId,
          observation.observationId as number,
          observation
        )
        .then(listObservations)
        .finally(loader.disable);
    } catch (e) {
      console.error("Couldn't update opservation " + observation.title);
      loader.reset();
    }
  }

  async function deleteObservation(requestObservation: Observation) {
    try {
      loader.enable();
      await observationsApi
        .deleteObservation(
          props.studyId,
          requestObservation.observationId as number
        )
        .then(listObservations)
        .finally(loader.disable);
    } catch (e) {
      console.error(
        'Cannot delete observation ' + requestObservation.observationId,
        e
      );
      loader.reset();
    }
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
      },
      props: {
        header: headerText,
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
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
    try {
      loader.enable();
      observationsApi
        .addObservation(props.studyId, newObservation)
        .then(listObservations)
        .finally(loader.disable);
    } catch (e) {
      console.error('cannot create observation', e);
      loader.disable();
    }
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
      :table-actions="tableActions"
      :sort-options="{ sortField: 'title', sortOrder: -1 }"
      :editable-access="actionsVisible"
      :loading="loader.loading.value"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('observation.observationList.emptyListMsg')"
      @onselect="openEditObservation($event)"
      @onaction="execute($event)"
      @onchange="updateObservation($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

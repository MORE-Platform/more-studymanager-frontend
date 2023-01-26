<script setup lang="ts">
  import { ref, Ref, PropType } from 'vue';
  import { useInterventionsApi } from '../composable/useApi';
  import { useComponentsApi } from '../composable/useApi';
  import {
    Intervention,
    StudyGroup,
    Action,
    Trigger,
    ComponentFactory,
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableChoice,
  } from '../models/MoreTableModel';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { AxiosResponse } from 'axios';
  import { useDialog } from 'primevue/usedialog';
  import InterventionDialog from '../components/dialog/InterventionDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';

  const loader = useLoader();
  const { interventionsApi } = useInterventionsApi();
  const { componentsApi } = useComponentsApi();
  const { t } = useI18n();

  const interventionList: Ref<Intervention[]> = ref([]);
  const dialog = useDialog();
  //const interventionTypes: Ref<MoreTableActionOptions[]> = ref([])

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
    studyStatus: { type: String as PropType<StudyStatus>, required: true },
  });

  const actionsVisible =
    props.studyStatus === StudyStatus.Draft ||
    props.studyStatus === StudyStatus.Paused;

  const groupStatuses = props.studyGroups.map(
    (item) =>
      ({
        label: item.title,
        value: item.studyGroupId?.toString(),
      } as MoreTableChoice)
  );
  groupStatuses.push({ label: 'Entire Study', value: null });

  async function getActionFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents('action')
      .then((response: any) => response.data);
  }

  async function getTriggerFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents('trigger')
      .then((response: any) => response.data);
  }

  const interventionColumns: MoreTableColumn[] = [
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
      label: t('intervention.interventionList.action.add'),
      visible: () => actionsVisible,
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
        header: t('intervention.dialog.header.delete'),
        message: t('intervention.dialog.msg.delete'),
      },
    },
  ];

  function listInterventions(): void {
    interventionsApi
      .listInterventions(props.studyId)
      .then((response: AxiosResponse) => {
        interventionList.value = response.data;
      });
  }

  async function listActions(interventionId?: number) {
    if (interventionId) {
      return interventionsApi
        .listActions(props.studyId, interventionId)
        .then((response: any) => response.data);
    } else {
      return undefined;
    }
  }
  async function getTrigger(interventionId?: number) {
    if (interventionId) {
      return interventionsApi
        .getTrigger(props.studyId, interventionId)
        .then((response: any) => response.data);
    } else {
      return undefined;
    }
  }

  function execute(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete':
        return deleteIntervention(action.row);
      case 'create':
        return openInterventionDialog(t('intervention.dialog.header.create'));
      case 'clone':
        return openInterventionDialog(
          t('intervention.dialog.header.clone'),
          action.row,
          true
        );
      default:
        console.error('no handler for action', action);
    }
  }

  async function changeValue(intervention: Intervention) {
    try {
      //do change immediately (ux)
      const i = interventionList.value.findIndex(
        (i: Intervention) => i.interventionId === intervention.interventionId
      );
      if (i > -1) {
        interventionList.value[i] = intervention;
      }

      await interventionsApi
        .updateIntervention(
          props.studyId,
          intervention.interventionId as number,
          intervention
        )
        .then(listInterventions);
    } catch (e) {
      console.error("Couldn't update intervention " + intervention.title);
      loader.reset();
    }
  }

  async function deleteIntervention(requestIntervention: Intervention) {
    try {
      await interventionsApi
        .deleteIntervention(
          props.studyId,
          requestIntervention.interventionId as number
        )
        .then(listInterventions);
    } catch (e) {
      console.error(
        'Cannot delete intervention ' + requestIntervention.interventionId,
        e
      );
      loader.reset();
    }
  }

  async function createIntervention(object: any) {
    const interventionId: Ref<number | undefined> = ref(
      await addIntervention(object.intervention)
    );

    if (interventionId.value) {
      await updateTrigger(interventionId.value as number, object.trigger);
      object.actions.forEach((action: Action) => {
        createAction(interventionId.value as number, action);
      });

      listInterventions();
    }
  }

  async function addIntervention(intervention: Intervention) {
    try {
      return interventionsApi
        .addIntervention(props.studyId, intervention)
        .then((response: AxiosResponse) => response.data.interventionId);
    } catch (e) {
      loader.reset();
      console.error('Cannot create intervention', e);
    }
  }

  async function createAction(interventionId: number, action: Action) {
    try {
      await interventionsApi
        .createAction(props.studyId, interventionId, action)
        .then(listInterventions);
    } catch (e) {
      loader.reset();
      console.error('Cannot create action on: ' + interventionId, e);
    }
  }

  async function updateAction(
    interventionId: number,
    actionId: number,
    action: Action
  ) {
    try {
      await interventionsApi.updateAction(
        props.studyId,
        interventionId,
        actionId,
        action
      );
    } catch (e) {
      loader.reset();
      console.error('Cannot update action: ' + action.actionId, e);
    }
  }

  async function deleteAction(interventionId: number, actionId: number) {
    try {
      await interventionsApi.deleteAction(
        props.studyId,
        interventionId,
        actionId
      );
    } catch (e) {
      loader.reset();
      console.error('Cannot delete action: ' + actionId, e);
    }
  }

  async function updateTrigger(interventionId: number, trigger: Trigger) {
    try {
      await interventionsApi.updateTrigger(
        props.studyId,
        interventionId,
        trigger
      );
    } catch (e) {
      loader.reset();
      console.error('Cannot create trigger on: ' + interventionId, e);
    }
  }

  async function updateInterventionData(object: any) {
    await updateIntervention(object.intervention);

    if (object.intervention.interventionId) {
      await updateTrigger(
        object.intervention.interventionId,
        object.trigger
      ).then(() => {
        listInterventions();
      });

      object.actions.forEach((action: Action) => {
        if (action.actionId) {
          updateAction(
            object.intervention.interventionId as number,
            action.actionId,
            action
          );
        } else {
          createAction(object.intervention.interventionId as number, action);
        }
      });
      object.removeActions.forEach((actionId: number) => {
        deleteAction(object.intervention.interventionId as number, actionId);
      });
    }
  }

  async function updateIntervention(intervention: Intervention) {
    try {
      const i = interventionList.value.findIndex(
        (v) => v.interventionId === intervention.interventionId
      );
      if (i > -1) {
        interventionList.value[i] = intervention;

        await interventionsApi
          .updateIntervention(
            props.studyId,
            intervention.interventionId as number,
            intervention
          )
          .then(listInterventions);
        return i;
      }
    } catch (e) {
      loader.reset();
      console.error(
        'Cannot update intervention: ' + intervention.interventionId,
        e
      );
    }
  }

  function openEditIntervetion(interventionId: number) {
    const intervention = interventionList.value.find(
      (i) => i.interventionId === interventionId
    );
    if (intervention) {
      let dialogTitle = t('intervention.dialog.header.edit');
      if (
        props.studyStatus === StudyStatus.Active ||
        props.studyStatus === StudyStatus.Closed
      ) {
        dialogTitle = t('intervention.dialog.header.view');
      }
      openInterventionDialog(dialogTitle, intervention);
    }
  }

  function openInterventionDialog(
    headerText: string,
    intervention?: Intervention,
    clone?: boolean
  ) {
    Promise.all([
      listActions(intervention?.interventionId),
      getTrigger(intervention?.interventionId),
      getActionFactories(),
      getTriggerFactories(),
    ])
      .then(
        ([actionsRes, triggerRes, actionFactoriesRes, triggerFactoriesRes]) => {
          dialog.open(InterventionDialog, {
            data: {
              groupStates: groupStatuses,
              intervention: intervention,
              studyId: props.studyId,
              actionsData: actionsRes,
              triggerData: triggerRes,
              actionFactories: actionFactoriesRes,
              triggerFactories: triggerFactoriesRes,
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
              closeOnEscape: false,
            },
            onClose: (options) => {
              if (options?.data) {
                if (options.data?.intervention.interventionId) {
                  if (clone) {
                    createIntervention(options.data);
                  } else {
                    updateInterventionData(options.data);
                  }
                } else {
                  createIntervention(options.data);
                }
              }
            },
          });
        }
      )
      .catch(console.error);
  }

  listInterventions();
</script>

<template>
  <div class="interventions-list">
    <MoreTable
      row-id="interventionId"
      :title="$t('intervention.interventionList.title')"
      :subtitle="$t('intervention.interventionList.description')"
      :columns="interventionColumns"
      :rows="interventionList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :sort-options="{ sortField: 'title', sortOrder: -1 }"
      :loading="loader.isLoading.value"
      :editable-access="actionsVisible"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('intervention.interventionList.emptyListMsg')"
      @onselect="openEditIntervetion($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

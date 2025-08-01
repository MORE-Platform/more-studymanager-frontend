/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
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
    ListComponentsComponentTypeEnum,
  } from '@gs';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableChoice,
    MoreTableSortOptions,
    RowSelectionMode,
  } from '../models/MoreTableModel';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useDialog } from 'primevue/usedialog';
  import InterventionDialog from '../components/dialog/InterventionDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import Button from 'primevue/button';

  const loader = useLoader();
  const { interventionsApi } = useInterventionsApi();
  const { componentsApi } = useComponentsApi();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();

  const interventionList: Ref<Intervention[]> = ref([]);
  const dialog = useDialog();

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
    studyStatus: { type: String as PropType<StudyStatus>, required: true },
  });

  const sortOptions: MoreTableSortOptions = {
    sortField: 'title',
    sortOrder: -1,
  };

  const actionsVisible =
    props.studyStatus === StudyStatus.Draft ||
    props.studyStatus === StudyStatus.Paused ||
    props.studyStatus === StudyStatus.PausedPreview;

  const groupStatuses = props.studyGroups.map(
    (studyGroup) =>
      ({
        label: studyGroup.title,
        value: studyGroup.studyGroupId?.toString(),
      }) as MoreTableChoice,
  );
  groupStatuses.push({
    label: t('global.placeholder.entireStudy'),
    value: null,
  } as MoreTableChoice);

  async function getActionFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents(ListComponentsComponentTypeEnum.Action)
      .then((response: any) => response.data);
  }

  async function getTriggerFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents(ListComponentsComponentTypeEnum.Trigger)
      .then((response: any) => response.data);
  }

  const interventionColumns: MoreTableColumn[] = [
    {
      field: 'title',
      header: t('study.props.title'),
      editable: true,
      sortable: true,
      filterable: true,
      columnWidth: '16vw',
    },
    {
      field: 'purpose',
      header: t('study.props.purpose'),
      editable: true,
      type: MoreTableFieldType.longtext,
      columnWidth: '25vw',
    },
    {
      field: 'studyGroupId',
      header: t('study.props.studyGroup'),
      type: MoreTableFieldType.choice,
      editable: { enabled: true, values: groupStatuses },
      sortable: true,
      filterable: true,
      placeholder: t('global.placeholder.entireStudy'),
      columnWidth: '10vw',
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'clone',
      label: t('global.labels.clone'),
      tooltip: t('tooltips.moreTable.cloneIntervention'),
      visible: () => actionsVisible,
    },
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteIntervention'),
      visible: () => actionsVisible,
      confirmDeleteDialog: {
        header: t('intervention.dialog.header.delete'),
        message: t('intervention.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('intervention.dialog.deleteMsg.intro'),
              warningMsg: t('intervention.dialog.deleteMsg.warning'),
              confirmMsg: t('intervention.dialog.deleteMsg.confirm'),
              row: row,
              elTitle: row.title,
              elInfoTitle: t('study.props.purpose'),
              elInfoDesc: row.purpose,
            },
            props: {
              header: t('intervention.dialog.header.delete'),
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
                executeAction({
                  id: 'delete',
                  row: options.data,
                } as MoreTableRowActionResult);
              }
            },
          }),
      },
    },
  ];

  const endRowActions: MoreTableAction[] = [
    {
      id: 'edit',
      label: t('global.labels.edit'),
      icon: 'pi pi-cog',
      tooltip: t('tooltips.editBtn'),
    },
  ];

  function listInterventions(): void {
    interventionsApi
      .listInterventions(props.studyId)
      .then((response: AxiosResponse) => {
        interventionList.value = response.data;
      });
  }

  async function listActions(
    interventionId?: number,
  ): Promise<Action[] | undefined> {
    if (interventionId) {
      return interventionsApi
        .listActions(props.studyId, interventionId)
        .then((response: any) => response.data);
    } else {
      return undefined;
    }
  }

  async function getTrigger(
    interventionId?: number,
  ): Promise<Trigger | undefined> {
    if (interventionId) {
      return interventionsApi
        .getTrigger(props.studyId, interventionId)
        .then((response: any) => response.data);
    } else {
      return undefined;
    }
  }

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row as Intervention;
    switch (action.id) {
      case 'delete':
        deleteIntervention(row);
        break;
      case 'clone':
        openInterventionDialog(
          t('intervention.dialog.header.clone'),
          row,
          true,
        );
        break;
      case 'edit':
        openEditIntervention(row.interventionId);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  async function changeValue(intervention: Intervention): Promise<void> {
    await interventionsApi
      .updateIntervention(
        props.studyId,
        intervention.interventionId as number,
        intervention,
      )
      .then(listInterventions)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `Couldn't update intervention ${intervention.title}`,
        ),
      );
  }

  async function deleteIntervention(
    requestIntervention: Intervention,
  ): Promise<void> {
    await interventionsApi
      .deleteIntervention(
        props.studyId,
        requestIntervention.interventionId as number,
      )
      .then(listInterventions)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `Cannot delete intervention ${requestIntervention.interventionId}`,
        ),
      );
  }

  async function createIntervention(object: any): Promise<void> {
    const interventionId: number | undefined = await addIntervention(
      object.intervention,
    );

    if (interventionId) {
      await updateTrigger(interventionId, object.trigger);
      object.actions.forEach((action: Action) => {
        createAction(interventionId, action);
      });

      listInterventions();
    }
  }

  async function addIntervention(intervention: Intervention): Promise<number> {
    return interventionsApi
      .addIntervention(props.studyId, intervention)
      .then((response: AxiosResponse) => response.data.interventionId)
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'Cannot create intervention'),
      );
  }

  async function createAction(
    interventionId: number,
    action: Action,
  ): Promise<void> {
    await interventionsApi
      .createAction(props.studyId, interventionId, action)
      .then(listInterventions)
      .catch((e: AxiosError) =>
        handleIndividualError(e, `Cannot create action on: ${interventionId}`),
      );
  }

  async function updateAction(
    interventionId: number,
    actionId: number,
    action: Action,
  ): Promise<void> {
    await interventionsApi
      .updateAction(props.studyId, interventionId, actionId, action)
      .catch((e: AxiosError) =>
        handleIndividualError(e, `Cannot update action: ${action.actionId}`),
      );
  }

  async function deleteAction(
    interventionId: number,
    actionId: number,
  ): Promise<void> {
    await interventionsApi
      .deleteAction(props.studyId, interventionId, actionId)
      .catch((e: AxiosError) =>
        handleIndividualError(e, `Cannot delete action: ${actionId}`),
      );
  }

  async function updateTrigger(
    interventionId: number,
    trigger: Trigger,
  ): Promise<void> {
    await interventionsApi
      .updateTrigger(props.studyId, interventionId, trigger)
      .catch((e: AxiosError) =>
        handleIndividualError(e, `Cannot create trigger on: ${interventionId}`),
      );
  }

  async function updateInterventionData(object: any): Promise<void> {
    await updateIntervention(object.intervention);

    if (object.intervention.interventionId) {
      await updateTrigger(
        object.intervention.interventionId,
        object.trigger,
      ).then(() => {
        listInterventions();
      });

      object.actions.forEach((action: Action) => {
        if (action.actionId) {
          updateAction(
            object.intervention.interventionId as number,
            action.actionId,
            action,
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

  async function updateIntervention(intervention: Intervention): Promise<void> {
    await interventionsApi
      .updateIntervention(
        props.studyId,
        intervention.interventionId as number,
        intervention,
      )
      .then(listInterventions)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `Cannot update intervention: ${intervention.interventionId}`,
        ),
      );
  }

  function openEditIntervention(interventionId: number | undefined): void {
    const intervention = interventionList.value.find(
      (i) => i.interventionId === interventionId,
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
    clone?: boolean,
  ): void {
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
                width: '60vw',
                maxHeight: '92vh',
              },
              breakpoints: {
                '1280px': '70vw',
                '960px': '80vw',
                '640px': '90vw',
              },
              modal: true,
              draggable: false,
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
        },
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
      :end-row-actions="endRowActions"
      :sort-options="sortOptions"
      :loading="loader.isLoading.value"
      :editable-access="actionsVisible"
      :enable-row-selection="RowSelectionMode.Single"
      :editable-user-roles="[StudyRole.StudyAdmin, StudyRole.StudyOperator]"
      :empty-message="$t('intervention.interventionList.emptyListMsg')"
      class="table-title-width table-btn-min-height"
      @on-select="openEditIntervention($event)"
      @on-action="executeAction($event)"
      @on-change="changeValue($event)"
    >
      <template #tableActions="{ isInEditMode }">
        <div>
          <Button
            type="button"
            icon="pi pi-plus"
            :label="t('intervention.interventionList.action.add')"
            :disabled="isInEditMode ? true : !actionsVisible"
            @click="
              openInterventionDialog(t('intervention.dialog.header.create'))
            "
          />
        </div>
      </template>
    </MoreTable>
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

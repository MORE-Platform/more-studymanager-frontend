/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { PropType, Ref, ref } from 'vue';
  import { useComponentsApi, useObservationsApi } from '../composable/useApi';
  import {
    ComponentFactory,
    Event,
    Observation,
    ObservationSchedule,
    RelativeEvent,
    StudyGroup,
    StudyRole,
    StudyStatus,
  } from '@gs';
  import {
    MoreTableAction,
    MoreTableChoice,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
    RowSelectionMode,
  } from '../models/MoreTableModel';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useDialog } from 'primevue/usedialog';
  import ObservationDialog from '../components/dialog/ObservationDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import { ScheduleType } from '../models/Scheduler';
  import Button from 'primevue/button';
  import Menu from 'primevue/menu';
  import { timeToHourMinuteString } from '../utils/dateUtils';

  const loader = useLoader();
  const { observationsApi } = useObservationsApi();
  const { componentsApi } = useComponentsApi();
  const { t, d } = useI18n();
  const { handleIndividualError } = useErrorHandling();

  const observationList: Ref<Observation[]> = ref([]);
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

  async function getFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }

  const factories: ComponentFactory[] = await getFactories();
  const observationTypes: any[] = factories.map((cf: ComponentFactory) => ({
    label: cf.title ? t(cf.title) : '',
    value: cf.componentId,
    command: (): void => {
      openObservationDialog(t('observation.dialog.header.create'), {
        type: cf.componentId,
      });
    },
  }));

  const observationColumns: MoreTableColumn[] = [
    {
      field: 'typeLabel',
      header: t('observation.props.type'),
      sortable: true,
      filterable: true,
      columnWidth: '5vw',
    },
    {
      field: 'title',
      header: t('study.props.title'),
      editable: true,
      sortable: true,
      filterable: true,
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
      editable: { enabled: true, values: groupStatuses },
      sortable: true,
      filterable: true,
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
    {
      field: 'scheduleType',
      header: t('global.labels.scheduleType'),
      columnWidth: '3vw',
      sortable: true,
    },
    {
      field: 'scheduleStart',
      header: t('global.labels.start'),
      columnWidth: '3vw',
      sortable: true,
    },
    {
      field: 'scheduleEnd',
      header: t('global.labels.end'),
      columnWidth: '3vw',
      sortable: true,
    },
    {
      field: 'hasRepetition',
      header: t('scheduler.labels.repeat'),
      type: MoreTableFieldType.binaryIcon,
      columnWidth: '2vw',
      sortable: true,
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'clone',
      label: t('global.labels.clone'),
      tooltip: t('tooltips.moreTable.cloneObservation'),
      visible: () => actionsVisible,
    },
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteObservation'),
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
                ? `${row.title} (${getObservationTypeString(row.type)})`
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

  function getObservationTypeString(observationType: string): string {
    return t(
      factories.find((f) => f.componentId === observationType)?.title as string,
    );
  }

  async function listObservations(): Promise<void> {
    observationList.value = await observationsApi
      .listObservations(props.studyId)
      .then((response: AxiosResponse) => {
        return response.data.map((observation: Observation) => {
          return {
            studyId: observation.studyId,
            observationId: observation.observationId,
            studyGroupId: observation.studyGroupId,
            title: observation.title,
            purpose: observation.purpose,
            participantInfo: observation.participantInfo,
            type: observation.type,
            typeLabel: getObservationTypeString(observation.type as string),
            properties: observation.properties,
            schedule: observation.schedule,
            scheduleType: observation.schedule?.type
              ? t(`scheduler.type.${observation.schedule?.type}`)
              : '',
            scheduleStart: getScheduleDate(observation.schedule, 'dtstart'),
            scheduleEnd: getScheduleDate(observation.schedule, 'dtend'),
            created: observation.created,
            modified: observation.modified,
            hidden: observation.hidden,
            noSchedule: observation.noSchedule,
            hasRepetition: getScheduleHasRepetition(observation.schedule),
          };
        });
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot list observations'),
      );
  }

  function getScheduleHasRepetition(
    schedule: ObservationSchedule | undefined,
  ): boolean {
    if (schedule) {
      switch (schedule.type) {
        case ScheduleType.Event: {
          const s = schedule as Event;
          return !!s.rrule;
        }
        case ScheduleType.RelativeEvent: {
          const s = schedule as RelativeEvent;
          return !!s.rrrule;
        }
      }
    }
    return false;
  }

  function getScheduleDate(
    scheduler: ObservationSchedule | undefined,
    prop: string,
  ): string | undefined {
    switch (scheduler?.type) {
      case ScheduleType.Event: {
        const schedule = scheduler as Event;
        switch (prop) {
          case 'dtstart':
            return schedule.dtstart
              ? `${d(new Date(schedule.dtstart), 'long')}`
              : undefined;
          case 'dtend':
            return schedule.dtend
              ? `${d(new Date(schedule.dtend), 'long')}`
              : undefined;
          default:
            return undefined;
        }
      }
      case ScheduleType.RelativeEvent: {
        const schedule = scheduler as RelativeEvent;
        switch (prop) {
          case 'dtstart':
            return schedule.dtstart.offset?.value &&
              schedule.dtstart.offset?.unit
              ? `${t(
                  `scheduler.preview.unit.${schedule.dtstart.offset.unit}`,
                )} ${schedule.dtstart.offset.value}, ${timeToHourMinuteString(schedule.dtstart.time)}`
              : undefined;
          case 'dtend':
            return schedule.dtend.offset?.value && schedule.dtend.offset?.unit
              ? `${t(`scheduler.preview.unit.${schedule.dtend.offset.unit}`)} ${
                  schedule.dtend.offset.value
                }, ${timeToHourMinuteString(schedule.dtend.time)} `
              : undefined;
          default:
            return undefined;
        }
      }
    }

    return '';
  }

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row as Observation;
    switch (action.id) {
      case 'delete':
        deleteObservation(row);
        break;
      case 'clone':
        openObservationDialog(t('observation.dialog.header.clone'), row, true);
        break;
      case 'edit':
        openEditObservation(row.observationId);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  async function updateObservation(observation: Observation): Promise<void> {
    await observationsApi
      .updateObservation(
        props.studyId,
        observation.observationId as number,
        observation,
      )
      .then(listObservations)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `Couldn't update observation ${observation.title}`,
        ),
      );
  }

  async function deleteObservation(
    requestObservation: Observation,
  ): Promise<void> {
    await observationsApi
      .deleteObservation(
        props.studyId,
        requestObservation.observationId as number,
      )
      .then(listObservations)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `Cannot delete observation ${requestObservation.observationId}`,
        ),
      );
  }

  function factoryForType(type?: string): ComponentFactory | undefined {
    return factories.find((f) => f.componentId === type);
  }

  function openObservationDialog(
    headerText: string,
    observation?: Observation,
    clone?: boolean,
  ): void {
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
            if (clone) {
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

  function createObservation(newObservation: Observation): void {
    observationsApi
      .addObservation(props.studyId, newObservation)
      .then(listObservations)
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'Cannot create observation'),
      );
  }

  function openEditObservation(observationId: number | undefined): void {
    const observation = observationList.value.find(
      (observation) => observation.observationId === observationId,
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

  const menu = ref();
  function toggleButtonMenu(event: MouseEvent): void {
    menu.value.toggle(event);
  }
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
      :end-row-actions="endRowActions"
      :sort-options="sortOptions"
      :editable-access="actionsVisible"
      :loading="loader.isLoading.value"
      :editable-user-roles="[StudyRole.StudyAdmin, StudyRole.StudyOperator]"
      :empty-message="$t('observation.observationList.emptyListMsg')"
      :component-factory="factories"
      :enable-row-selection="RowSelectionMode.Single"
      class="table-title-width"
      @on-select="openEditObservation($event)"
      @on-action="executeAction($event)"
      @on-change="updateObservation($event)"
    >
      <template #tableActions="{ isInEditMode }">
        <div>
          <Button
            type="button"
            :disabled="isInEditMode ? true : !actionsVisible"
            @click="toggleButtonMenu($event)"
            >{{ t('observation.observationList.action.add') }}
            <span class="pi pi-angle-down ml-3"></span
          ></Button>
          <Menu ref="menu" :model="observationTypes" :popup="true" />
        </div>
      </template>
    </MoreTable>
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

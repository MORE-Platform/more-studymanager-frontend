<script setup lang="ts">
  import { useObservationGroupStore } from '../stores/observationGroupStore';
  import { useDialog } from 'primevue/usedialog';
  import { useI18n } from 'vue-i18n';
  import { computed, PropType } from 'vue';
  import { ObservationGroup, StudyRole, StudyStatus } from '@gs';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableRowActionResult
  } from '../models/MoreTableModel';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import Button from 'primevue/button';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';

  const observationGroupStore = useObservationGroupStore();
  const dialog = useDialog();
  const { t } = useI18n();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true
    },
    userRoles: {
      type: Array as PropType<Array<StudyRole>>,
      required: true,
    },
    studyStatus: {
      type: String as PropType<StudyStatus>,
      required: true,
    },
  })

  const observationGroups = computed(() => observationGroupStore.observationGroups);

  const editableRoles: StudyRole[] = [
    StudyRole.StudyAdmin,
    StudyRole.StudyOperator,
  ];

  const actionsVisible =
    (props.userRoles.some((r) => editableRoles.includes(r)) &&
      props.studyStatus === StudyStatus.Draft) ||
    (props.userRoles.some((r) => editableRoles.includes(r)) &&
      props.studyStatus === StudyStatus.Paused) ||
    (props.userRoles.some((r) => editableRoles.includes(r)) &&
      props.studyStatus === StudyStatus.PausedPreview);

  const observationGroupColumns: MoreTableColumn[] = [
    {
      field: 'observationGroupId',
      header: t('global.labels.id'),
      sortable: true
    },
    {
      field: 'title',
      placeholder: t('studyGroup.groupList.placeholder.title'),
      header: t('study.props.title'),
      editable: true,
      columnWidth: '18vw',
    },
    {
      field: 'purpose',
      header: t('study.props.purpose'),
      editable: true,
      placeholder: t('studyGroup.groupList.placeholder.purpose'),
      columnWidth: '20vw',
    },
    {
      field: 'numberOfParticipants',
      header: t('participants.plural'),
      placeholder: '0',
      columnWidth: '5vw'
    },
    {
      field: 'numberOfObservations',
      header: t('studyNavigation.tabs.observations'),
      placeholder: '0',
      columnWidth: '5vw'
    },
    {
      field: 'numberOfInterventions',
      header: t('studyNavigation.tabs.interventions'),
      placeholder: '0',
      columnWidth: '5vw'
    }
  ]

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteObservationGroupBtn'),
      visible: () => actionsVisible,
      confirmDeleteDialog: {
        header: t('observationGroup.dialog.header.delete'),
        message: t('observationGroup.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('observationGroup.dialog.deleteMsg.intro'),
              warningMsg: t('observationGroup.dialog.deleteMsg.warning'),
              confirmMsg: t('observationGroup.dialog.deleteMsg.confirm'),
              row: row,
              elTitle: row.title,
              elInfoTitle: t('study.props.purpose'),
              elInfoDesc: row.purpose,
            },
            props: {
              header: t('observationGroup.dialog.header.delete'),
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

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row

    switch (action.id) {
      case 'delete':
        observationGroupStore.deleteObservationGroup(row as ObservationGroup);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  function changeValueInPlace(observationGroup: ObservationGroup): void {
    observationGroupStore.updateObservationGroup(
      props.studyId, observationGroup
    );
  }
</script>

<template>
  <div>
    <MoreTable
      row-id="observationGroupId"
      :title="$t('observationGroup.plural')"
      :subtitle="$t('observationGroup.groupList.description')"
      :columns="observationGroupColumns"
      :rows="observationGroups"
      :editable-access="actionsVisible"
      :row-actions="rowActions"
      :edit-access-roles="editableRoles"
      :empty-message="$t('observationGroup.groupList.placeholder.emptyGroupList')"
      class="table-title-width"
      @on-action="executeAction($event)"
      @on-change="changeValueInPlace($event)"
    >
      <template #tableActions>
        <div>
          <Button
            type="button"
            icon="pi pi-plus"
            :label="t('observationGroup.dialog.header.create')"
            :disabled="!actionsVisible"
            @click="observationGroupStore.createObservationGroups(props.studyId)"
          />
        </div>
      </template>
    </MoreTable>
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

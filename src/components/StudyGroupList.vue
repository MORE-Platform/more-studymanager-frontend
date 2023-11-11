/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Österreichische Vereinigung zur
 * Förderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
<script setup lang="ts">
  import { PropType } from 'vue';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableRowActionResult,
  } from '../models/MoreTableModel';
  import {
    StudyGroup,
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';
  import { useStudyGroupStore } from '../stores/studyGroupStore';
  import { useI18n } from 'vue-i18n';
  import { useDialog } from 'primevue/usedialog';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';

  const studyGroupStore = useStudyGroupStore();
  const dialog = useDialog();
  const { t } = useI18n();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    userRoles: {
      type: Array as PropType<Array<StudyRole>>,
      required: true,
    },
    studyStatus: {
      type: String as PropType<StudyStatus>,
      required: true,
    },
  });

  const editableRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];
  const studyGroupColumns: MoreTableColumn[] = [
    { field: 'studyGroupId', header: t('global.labels.id'), sortable: true },
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
      columnWidth: '32vw',
    },
  ];
  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteStudyGroupBtn'),
      visible: () => getEditAccess(),
      confirmDeleteDialog: {
        header: t('studyGroup.dialog.header.delete'),
        message: t('studyGroup.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('studyGroup.dialog.deleteMsg.intro'),
              warningMsg: t('studyGroup.dialog.deleteMsg.warning'),
              confirmMsg: t('studyGroup.dialog.deleteMsg.confirm'),
              row: row,
              elTitle: row.title,
              elInfoTitle: t('study.props.purpose'),
              elInfoDesc: row.purpose,
            },
            props: {
              header: t('studyGroup.dialog.header.delete'),
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
                  row: options.data as StudyGroup,
                });
              }
            },
          }),
      },
    },
  ];
  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      label: t('studyGroup.dialog.header.create'),
      icon: 'pi pi-plus',
      visible: () => getEditAccess(),
    },
  ];

  function getEditAccess(): boolean {
    return (
      (props.userRoles.some((r) => editableRoles.includes(r)) &&
        props.studyStatus === StudyStatus.Draft) ||
      (props.userRoles.some((r) => editableRoles.includes(r)) &&
        props.studyStatus === StudyStatus.Paused)
    );
  }

  function executeAction(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete':
        return studyGroupStore.deleteStudyGroup(action.row);
      case 'create':
        return studyGroupStore.createStudyGroup(props.studyId);
      default:
        console.error('no handler for action', action);
    }
  }
  function changeValueInPlace(studyGroup: StudyGroup) {
    studyGroupStore.updateStudyGroup(studyGroup);
  }
</script>

<template>
  <div>
    <MoreTable
      row-id="studyGroupId"
      :title="$t('studyGroup.plural')"
      :subtitle="$t('studyGroup.groupList.description')"
      :columns="studyGroupColumns"
      :rows="studyGroupStore.studyGroups"
      :editable-access="getEditAccess()"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :edit-access-roles="editableRoles"
      :empty-message="$t('studyGroup.groupList.placeholder.emptyGroupList')"
      class="table-title-width"
      @onaction="executeAction($event)"
      @onchange="changeValueInPlace($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

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

  const studyGroupStore = useStudyGroupStore();
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
    },
    {
      field: 'purpose',
      header: t('study.props.purpose'),
      editable: true,
      placeholder: t('studyGroup.groupList.placeholder.purpose'),
    },
  ];
  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      visible: () => getEditAccess(),
      confirm: {
        header: t('studyGroup.dialog.header.delete'),
        message: t('studyGroup.dialog.msg.delete'),
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
      :columns="studyGroupColumns"
      :rows="studyGroupStore.studyGroups"
      :editable-access="getEditAccess()"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :edit-access-roles="editableRoles"
      :empty-message="$t('studyGroup.groupList.placeholder.emptyGroupList')"
      @onaction="executeAction($event)"
      @onchange="changeValueInPlace($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

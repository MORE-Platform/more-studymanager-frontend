<script setup lang="ts">
  import { PropType } from 'vue';
  import { useStudyGroupsApi } from '../composable/useApi';
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
  import { useI18n } from 'vue-i18n';
  import { useStudyStore } from '../stores/studyStore';

  const { studyGroupsApi } = useStudyGroupsApi();
  const { t } = useI18n();

  const studyStore = useStudyStore();
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

  const editAccess =
    (props.userRoles.some((r) => editableRoles.includes(r)) &&
      props.studyStatus === StudyStatus.Draft) ||
    (props.userRoles.some((r) => editableRoles.includes(r)) &&
      props.studyStatus === StudyStatus.Paused);

  const studyGroupColumns: MoreTableColumn[] = [
    { field: 'studyGroupId', header: 'id', sortable: true },
    {
      field: 'title',
      placeholder: 'Set a title',
      header: 'title',
      editable: true,
    },
    {
      field: 'purpose',
      header: 'purpose',
      editable: true,
      placeholder: 'Set a proper purpose for this group',
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: 'pi pi-trash',
      visible: () => editAccess,
      confirm: { header: 'Confirm', message: 'Really delete study group?' },
    },
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      label: 'Create Group',
      icon: 'pi pi-plus',
      visible: () => editAccess,
    },
  ];

  async function listStudyGroups(): Promise<void> {
    try {
      studyStore.studyGroups = await studyGroupsApi
        .listStudyGroups(props.studyId)
        .then((response) => response.data);
    } catch (e) {
      console.error('cannot list studies', e);
    }
  }

  function execute(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete':
        return deleteStudyGroup(action.row);
      case 'create':
        return createStudyGroup();
      default:
        console.error('no handler for action', action);
    }
  }

  function getTitle() {
    let title = undefined;
    let count = studyStore.studyGroups.length;
    while (title === undefined) {
      count += 1;
      const _title = t('group') + ' ' + count;
      if (!studyStore.studyGroups.find((g) => g.title === _title)) {
        title = _title;
      }
    }
    return title;
  }

  function createStudyGroup() {
    studyGroupsApi
      .createStudyGroup(props.studyId, {
        studyId: props.studyId,
        title: getTitle(),
      })
      .then(listStudyGroups);
  }

  function changeValue(studyGroup: StudyGroup) {
    const i = studyStore.studyGroups.findIndex(
      (v) => v.studyGroupId === studyGroup.studyGroupId
    );
    if (i > -1) {
      studyStore.studyGroups[i] = studyGroup;
      studyGroupsApi.updateStudyGroup(
        studyGroup.studyId as number,
        studyGroup.studyGroupId as number,
        studyGroup
      );
    }
  }

  function deleteStudyGroup(studyGroup: StudyGroup) {
    studyGroupsApi
      .deleteStudyGroup(
        studyGroup.studyId as number,
        studyGroup.studyGroupId as number
      )
      .then(listStudyGroups);
  }
</script>

<template>
  <div>
    <MoreTable
      row-id="studyGroupId"
      :title="$t('studyGroups')"
      :columns="studyGroupColumns"
      :rows="studyStore.studyGroups"
      :editable-access="editAccess"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :edit-access-roles="editableRoles"
      empty-message="No groups yet"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

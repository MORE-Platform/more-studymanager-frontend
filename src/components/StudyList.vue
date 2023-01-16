<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
  } from '../models/MoreTableModel';
  import { Study, StudyRole, StudyStatus } from '../generated-sources/openapi';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import StudyDialog from './dialog/StudyDialog.vue';
  import { useDialog } from 'primevue/usedialog';
  import InfoDialog from './dialog/InfoDialog.vue';
  import useLoader from '../composable/useLoader';
  import { useStudyStore } from '../stores/studyStore';
  import { useI18n } from 'vue-i18n';

  const studyStore = useStudyStore();
  const router = useRouter();
  const dialog = useDialog();
  const loader = useLoader();
  const { t } = useI18n();

  const studyColumns: MoreTableColumn[] = [
    { field: 'studyId', header: 'studyId', sortable: true },
    {
      field: 'title',
      header: 'title',
      editable: true,
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'purpose',
      header: 'purpose',
      editable: true,
      type: MoreTableFieldType.longtext,
    },
    {
      field: 'status',
      header: 'status',
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'userRoles',
      header: 'roles',
      sortable: true,
      filterable: { showFilterMatchModes: false },
      arrayLabels: [
        { label: 'Study Administrator', value: StudyRole.Admin },
        { label: 'Study Operator', value: StudyRole.Operator },
        { label: 'Study Viewer', value: StudyRole.Viewer },
      ],
    },
  ];
  const studyColumnsDraft: MoreTableColumn[] = [
    ...studyColumns,
    {
      field: 'plannedStart',
      header: 'plannedStart',
      type: MoreTableFieldType.calendar,
      editable: true,
      sortable: true,
    },
    {
      field: 'plannedEnd',
      header: 'plannedEnd',
      type: MoreTableFieldType.calendar,
      editable: true,
      sortable: true,
    },
  ];
  const tableActions: MoreTableAction[] = [
    { id: 'create', icon: 'pi pi-plus', label: 'Add new study' },
  ];
  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: 'pi pi-trash',
      confirm: {
        header: 'Delete Study',
        message:
          'Deletion of a study can’t be revoked! Are you sure you want to delete following study: ...',
      },
      visible: (data) =>
        data.status === StudyStatus.Draft &&
        data.userRoles.some((r: any) =>
          [StudyRole.Admin, StudyRole.Operator].includes(r)
        ),
    },
  ];
  const frontRowActions: MoreTableAction[] = [
    { id: 'copyId', label: 'Copy Url', icon: 'pi pi-copy' },
  ];
  const editAccessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];

  function goToStudy(id: string | unknown) {
    router.push({ name: 'Overview', params: { studyId: id as string } });
  }

  function executeAction(action: MoreTableRowActionResult<Study>) {
    switch (action.id) {
      case 'delete':
        return studyStore.deleteStudy(action.row.studyId);
      case 'create':
        return openCreateDialog();
      case 'copyId':
        return onCopyId(action.row.studyId, action.row.title);
      default:
        console.error('no handler for action', action);
    }
  }

  function updateStudyInPlace(study: Study) {
    studyStore.updateStudyInStudies(study);
  }

  function openCreateDialog() {
    dialog.open(StudyDialog, {
      props: {
        header: 'Create Study',
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
          studyStore.createStudy(options.data as Study);
        }
      },
    });
  }

  function onCopyId(studyId: number | undefined, title: string | undefined) {
    if (studyId) {
      const studyUrl = location.host + '/studies/' + studyId;
      navigator.clipboard.writeText(studyUrl);
      dialog.open(InfoDialog, {
        data: {
          message: t('linkCopy', { studyId, title }),
        },
        props: {
          header: 'Copied ID',
          style: {
            width: '50vw',
          },
          breakpoints: {
            '960px': '75vw',
            '640px': '90vw',
          },
          modal: true,
        },
      });
    }
  }

  loader.enable();
  studyStore.listStudies().finally(() => loader.disable());
</script>

<template>
  <div>
    <MoreTable
      row-id="studyId"
      :title="$t('dashboardTitle')"
      subtitle="This is the list of my own studies and studies where I am added as collaborator."
      :columns="studyColumnsDraft"
      :rows="studyStore.studies"
      :row-actions="rowActions"
      :front-row-actions="frontRowActions"
      :table-actions="tableActions"
      :editable-access="true"
      :sort-options="{ sortField: 'studyId', sortOrder: -1 }"
      :editable="function(data:Study){return data.status === StudyStatus.Draft || data.status === StudyStatus.Paused}"
      :edit-access-roles="editAccessRoles"
      :loading="loader.loading.value"
      empty-message="No studies yet"
      @onselect="goToStudy($event)"
      @onaction="executeAction($event)"
      @onchange="updateStudyInPlace($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

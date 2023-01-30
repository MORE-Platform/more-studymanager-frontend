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
    { field: 'studyId', header: t('study.props.studyId'), sortable: true },
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
      field: 'status',
      header: t('study.props.status'),
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'userRoles',
      header: t('study.props.roles'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
      arrayLabels: [
        { label: t('study.roles.admin'), value: StudyRole.Admin },
        { label: t('study.roles.operator'), value: StudyRole.Operator },
        { label: t('study.roles.viewer'), value: StudyRole.Viewer },
      ],
    },
  ];
  const studyColumnsDraft: MoreTableColumn[] = [
    ...studyColumns,
    {
      field: 'plannedStart',
      header: t('study.props.plannedStart'),
      type: MoreTableFieldType.calendar,
      editable: true,
      sortable: true,
    },
    {
      field: 'plannedEnd',
      header: t('study.props.plannedEnd'),
      type: MoreTableFieldType.calendar,
      editable: true,
      sortable: true,
    },
  ];
  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      icon: 'pi pi-plus',
      label: t('study.studyList.action.addStudy'),
    },
  ];
  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      confirm: {
        header: t('study.dialog.header.delete'),
        message: t('study.dialog.msg.delete'),
      },
      visible: (data) =>
        data.status === StudyStatus.Draft &&
        data.userRoles.some((r: any) =>
          [StudyRole.Admin, StudyRole.Operator].includes(r)
        ),
    },
  ];
  const frontRowActions: MoreTableAction[] = [
    {
      id: 'copyId',
      label: t('study.studyList.action.copyUrl'),
      icon: 'pi pi-copy',
    },
  ];
  const editAccessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];

  function goToStudy(id: string) {
    router.push({
      name: t('studyNavigation.tabs.overview'),
      params: { studyId: id },
    });
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
        header: t('study.dialog.header.create'),
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
          message: t('study.dialog.msg.urlCopied', { studyId, title }),
        },
        props: {
          header: t('study.dialog.header.urlCopied'),
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

  studyStore.listStudies();
</script>

<template>
  <div>
    <MoreTable
      row-id="studyId"
      :title="$t('study.studyList.title')"
      :subtitle="$t('study.studyList.description')"
      :columns="studyColumnsDraft"
      :rows="studyStore.studies"
      :row-actions="rowActions"
      :front-row-actions="frontRowActions"
      :table-actions="tableActions"
      :editable-access="true"
      :sort-options="{ sortField: 'studyId', sortOrder: -1 }"
      :editable="function(data:Study){return data.status === StudyStatus.Draft || data.status === StudyStatus.Paused}"
      :edit-access-roles="editAccessRoles"
      :loading="loader.isLoading.value"
      :empty-message="$t('study.studyList.emptyListMsg')"
      @onselect="goToStudy($event)"
      @onaction="executeAction($event)"
      @onchange="updateStudyInPlace($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

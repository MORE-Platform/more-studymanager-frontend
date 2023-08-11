<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import {
    FileUploadModeType,
    MoreTableAction,
    MoreTableActionResult,
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
  import useLoader from '../composable/useLoader';
  import { useStudyStore } from '../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import DeleteStudyDialog from './dialog/DeleteStudyDialog.vue';
  import { ref, Ref } from 'vue';
  import AlertMsg from './shared/AlertMsg.vue';

  const studyStore = useStudyStore();
  const router = useRouter();
  const dialog = useDialog();
  const loader = useLoader();
  const { t } = useI18n();

  const showMessage: Ref<boolean> = ref(false);
  const alertMessage: Ref<string> = ref('');

  const studyColumns: MoreTableColumn[] = [
    { field: 'studyId', header: t('study.props.studyId'), sortable: true },
    {
      field: 'title',
      header: t('study.props.title'),
      editable: true,
      sortable: true,
      filterable: { showFilterMatchModes: false },
      columnWidth: '30vw',
    },
    {
      field: 'purpose',
      header: t('study.props.purpose'),
      editable: true,
      type: MoreTableFieldType.longtext,
      columnWidth: '30vw',
    },
    {
      field: 'status',
      header: t('study.props.status'),
      filterable: { showFilterMatchModes: false },
      type: MoreTableFieldType.statusString,
    },
    {
      field: 'userRoles',
      header: t('study.props.roles'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
      columnWidth: '40vw',
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
    {
      id: 'import',
      icon: 'pi pi-upload',
      label: t('study.studyList.action.importStudy'),
      options: {
        type: 'fileUpload',
        values: [],
        uploadOptions: {
          mode: FileUploadModeType.basic,
        },
      },
    },
  ];
  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteStudyBtn'),
      confirmDeleteDialog: {
        header: t('study.dialog.header.delete'),
        message: t('study.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteStudyDialog, {
            data: {
              introMsg: t('study.dialog.deleteMsg.intro'),
              warningMsg: t('study.dialog.deleteMsg.warning'),
              confirmMsg: t('study.dialog.deleteMsg.confirm'),
              study: row as Study,
            },
            props: {
              header: t('study.dialog.header.delete'),
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
          }),
      },
      visible: (data) =>
        (data.status === StudyStatus.Draft &&
          data.userRoles.some((r: any) =>
            [StudyRole.Admin, StudyRole.Operator].includes(r)
          )) ||
        (data.status === StudyStatus.Closed &&
          data.userRoles.some((r: any) =>
            [StudyRole.Admin, StudyRole.Operator].includes(r)
          )),
    },
    {
      id: 'exportConfig',
      label: t('study.studyList.labels.exportStudyConfig'),
      icon: 'pi pi-download',
      tooltip: t('study.studyList.labels.exportStudyConfig'),
      visible: (data) =>
        data.userRoles.some((r: any) =>
          [StudyRole.Admin, StudyRole.Operator].includes(r)
        ),
    },
    {
      id: 'exportData',
      label: t('study.studyList.labels.exportStudyData'),
      icon: 'pi pi-chart-bar',
      tooltip: t('study.studyList.labels.exportStudyData'),
      visible: (data) =>
        data.userRoles.some((r: any) => [StudyRole.Admin].includes(r)),
    },
  ];

  const rowEndActions: MoreTableAction[] = [
    {
      id: 'goToStudy',
      label: t('tooltips.moreTable.goToStudy'),
      icon: 'pi pi-chevron-right',
      tooltip: t('tooltips.moreTable.goToStudy'),
      visible: () => true,
    },
  ];
  const frontRowActions: MoreTableAction[] = [
    {
      id: 'copyId',
      label: t('study.studyList.action.copyUrl'),
      icon: 'pi pi-copy',
      tooltip: t('tooltips.moreTable.copyStudyUrl'),
    },
  ];
  const editAccessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];

  function goToStudy(id: string) {
    router.push({
      name: t('studyNavigation.tabLink.overview'),
      params: { studyId: id },
    });
  }

  function executeAction(action: MoreTableRowActionResult<Study>) {
    switch (action.id) {
      case 'delete':
        return studyStore.deleteStudy(action.row.studyId);
      case 'create':
        return openCreateDialog();
      case 'import':
        return onImportStudy(action);
      case 'exportConfig':
        return onExportStudyConfig(action.row.studyId as number);
      case 'exportData':
        return onExportStudyData(action.row.studyId as number);
      case 'copyId':
        return onCopyId(action.row.studyId, action.row.title);
      case 'goToStudy':
        return goToStudy((action.row.studyId as number).toString());
      default:
        console.error('no handler for action', action);
    }
  }

  function updateStudyInPlace(study: Study) {
    studyStore.updateStudyInStudies(study);
  }

  function openCreateDialog() {
    dialog.open(StudyDialog, {
      data: {
        study: undefined,
      },
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
        draggable: false,
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
      showMessage.value = true;
      alertMessage.value = t('study.dialog.msg.urlCopied', { studyId, title });
    }
  }

  function onExportStudyConfig(studyId: number) {
    studyStore.exportStudyConfig(studyId);
  }

  function onExportStudyData(studyId: number) {
    studyStore.exportStudyData(studyId);
  }

  function onImportStudy(action: MoreTableActionResult) {
    if (action.properties?.files) {
      const file = action.properties?.files[0];
      studyStore.importStudy(file);
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
      :row-end-actions="rowEndActions"
      :front-row-actions="frontRowActions"
      :table-actions="tableActions"
      :editable-access="true"
      :sort-options="{ sortField: 'studyId', sortOrder: -1 }"
      :editable="(data:Study) => {return data.status === StudyStatus.Draft || data.status === StudyStatus.Paused}"
      :edit-access-roles="editAccessRoles"
      :loading="loader.isLoading.value"
      :empty-message="$t('study.studyList.emptyListMsg')"
      class="table-title-width"
      @onselect="goToStudy($event)"
      @onaction="executeAction($event)"
      @onchange="updateStudyInPlace($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />

    <AlertMsg
      :show-msg="showMessage"
      :message="alertMessage"
      type="msg"
      severity-type="success"
      style-modifier="msgPosition"
      @on-msg-change="showMessage = false"
    />
  </div>
</template>

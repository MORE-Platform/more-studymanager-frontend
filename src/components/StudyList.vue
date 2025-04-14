/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
    RowSelectionMode,
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
  import { reactive } from 'vue';
  import AlertMsg from './shared/AlertMsg.vue';
  import FileUpload, { FileUploadUploaderEvent } from 'primevue/fileupload';
  import Button from 'primevue/button';
  import { DownloadData } from '../models/DataDownloadModel';
  import { useToastService } from '../composable/toastService';

  const studyStore = useStudyStore();
  const router = useRouter();
  const dialog = useDialog();
  const loader = useLoader();
  const { t } = useI18n();
  const { showErrorToast } = useToastService();

  const sortOptions: MoreTableSortOptions = {
    sortField: 'studyId',
    sortOrder: -1,
  };

  const alert = reactive({
    message: '',
    showMessage: false,
  });

  function setAlertMessage(message: string): void {
    alert.message = message;
    alert.showMessage = true;
  }

  function clearAlertMessage(): void {
    alert.message = '';
    alert.showMessage = false;
  }

  const studyColumns: MoreTableColumn[] = [
    { field: 'studyId', header: t('study.props.studyId'), sortable: true },
    {
      field: 'title',
      header: t('study.props.title'),
      editable: true,
      sortable: true,
      filterable: true,
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
      filterable: true,
      type: MoreTableFieldType.statusString,
    },
    {
      field: 'userRoles',
      header: t('study.props.roles'),
      sortable: true,
      filterable: true,
      columnWidth: '40vw',
      arrayLabels: [
        { label: t('study.roles.admin'), value: StudyRole.StudyAdmin },
        { label: t('study.roles.operator'), value: StudyRole.StudyOperator },
        { label: t('study.roles.viewer'), value: StudyRole.StudyViewer },
      ],
    },
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
      visible: (study: Study) =>
        (study.status === StudyStatus.Draft &&
          !!study.userRoles?.some((r: any) =>
            [StudyRole.StudyAdmin, StudyRole.StudyOperator].includes(r),
          )) ||
        (study.status === StudyStatus.Closed &&
          !!study.userRoles?.some((r: any) =>
            [StudyRole.StudyAdmin, StudyRole.StudyOperator].includes(r),
          )),
    },
    {
      id: 'exportConfig',
      label: t('study.studyList.labels.exportStudyConfig'),
      icon: 'pi pi-download',
      tooltip: t('study.studyList.labels.exportStudyConfig'),
      visible: (study: Study) =>
        !!study.userRoles?.some((r: any) =>
          [StudyRole.StudyAdmin, StudyRole.StudyOperator].includes(r),
        ),
    },
    {
      id: 'exportData',
      label: t('study.studyList.labels.exportStudyData'),
      icon: 'pi pi-chart-bar',
      tooltip: t('study.studyList.labels.exportStudyData'),
      visible: (study: Study) =>
        !!study.userRoles?.some((r: any) => [StudyRole.StudyAdmin].includes(r)),
    },
  ];

  const endRowActions: MoreTableAction[] = [
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
  const editableRoles: StudyRole[] = [
    StudyRole.StudyAdmin,
    StudyRole.StudyOperator,
  ];

  function goToStudy(id: string): void {
    router.push({
      name: 'Overview',
      params: { studyId: id },
    });
  }

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row as Study;
    switch (action.id) {
      case 'delete':
        studyStore.deleteStudy(row.studyId);
        break;
      case 'exportConfig':
        onExportStudyConfig(row.studyId as number);
        break;
      case 'exportData':
        onExportStudyData(row.studyId as number);
        break;
      case 'copyId':
        onCopyId(row.studyId, row.title);
        break;
      case 'goToStudy':
        goToStudy((row.studyId as number).toString());
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  function updateStudyInPlace(study: Study): void {
    studyStore.updateStudyInStudies(study);
  }

  function openCreateDialog(): void {
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

  function onCopyId(
    studyId: number | undefined,
    title: string | undefined,
  ): void {
    if (studyId) {
      const studyUrl = `${location.host}/studies/${studyId}`;
      navigator.clipboard.writeText(studyUrl);
      setAlertMessage(t('study.dialog.msg.urlCopied', { studyId, title }));
    }
  }

  function onExportStudyConfig(studyId: number): void {
    studyStore.exportStudyConfig(studyId);
  }

  function onExportStudyData(studyId: number): void {
    studyStore.exportStudyData({ studyId } as DownloadData);
  }

  const onImportStudy = (event: FileUploadUploaderEvent): void => {
    const file: File = Array.isArray(event.files)
      ? event.files[0]
      : event.files;

    studyStore.importStudy(file).catch((): void => {
      showErrorToast(
        t('study.studyList.error.studyImportFailed', {
          filename: file?.name ? `"${file.name}"` : '',
        }),
      );
    });
  };

  studyStore.listStudies();
</script>

<template>
  <div>
    <MoreTable
      row-id="studyId"
      :title="$t('study.studyList.title')"
      :subtitle="$t('study.studyList.description')"
      :columns="studyColumns"
      :rows="studyStore.studies"
      :row-actions="rowActions"
      :end-row-actions="endRowActions"
      :front-row-actions="frontRowActions"
      :sort-options="sortOptions"
      :enable-row-selection="RowSelectionMode.Single"
      :editable="
        (data: Study) => {
          return (
            data.status === StudyStatus.Draft ||
            data.status === StudyStatus.Paused ||
            data.status === StudyStatus.PausedPreview
          );
        }
      "
      :edit-access-roles="editableRoles"
      :loading="loader.isLoading.value"
      :empty-message="$t('study.studyList.emptyListMsg')"
      class="table-title-width"
      @on-select="goToStudy($event)"
      @on-action="executeAction($event)"
      @on-change="updateStudyInPlace($event)"
    >
      <template #tableActions>
        <Button
          type="button"
          icon="pi pi-plus"
          class="text-nowrap p-2.5"
          :label="$t('study.studyList.action.addStudy')"
          @click="openCreateDialog()"
        />
        <FileUpload
          class="ml-2"
          mode="basic"
          :multiple="false"
          upload-icon="pi pi-upload"
          :choose-label="$t('study.studyList.action.importStudy')"
          :custom-upload="true"
          :auto="true"
          accept=".json"
          @uploader="onImportStudy($event)"
        />
      </template>
    </MoreTable>
    <ConfirmDialog />
    <DynamicDialog />
    <AlertMsg
      :show-msg="alert.showMessage"
      :message="alert.message"
      type="msg"
      severity-type="success"
      style-modifier="msgPosition"
      @on-msg-change="clearAlertMessage"
    />
  </div>
</template>

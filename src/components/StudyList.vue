<script setup lang="ts">
  import { ref, Ref } from 'vue';
  import { useStudiesApi } from '../composable/useApi';
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
  import { AxiosResponse } from 'axios';
  import { useDialog } from 'primevue/usedialog';
  import InfoDialog from './dialog/InfoDialog.vue';
  import useLoader from '../composable/useLoader';
  //import {UserRolesEnum} from '../models/UserModel';

  const { studiesApi } = useStudiesApi();
  const studyList: Ref<Study[]> = ref([]);
  const router = useRouter();
  const dialog = useDialog();
  const loader = useLoader();

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

  async function listStudies(): Promise<void> {
    try {
      studyList.value = await studiesApi
        .listStudies()
        .then((response: AxiosResponse) => response.data);
    } catch (e) {
      console.error('cannot list studies', e);
    }
  }

  async function createStudy(study: Study): Promise<void> {
    await studiesApi.createStudy(study).then(listStudies);
  }

  function goToStudy(id: string | unknown) {
    router.push({ name: 'Overview', params: { studyId: id as string } });
  }

  function execute(action: MoreTableRowActionResult<Study>) {
    switch (action.id) {
      case 'delete':
        return deleteStudy(action.row);
      case 'create':
        return openCreateDialog();
      case 'copyId':
        return onCopyId(action.row.studyId, action.row.title);
      default:
        console.error('no handler for action', action);
    }
  }

  function changeValue(study: Study) {
    study = study as Study;
    const i = studyList.value.findIndex((v) => v.studyId === study.studyId);
    if (i > -1) {
      studyList.value[i] = study;
      studiesApi.updateStudy(study.studyId as number, study);
    }
  }

  function deleteStudy(study: Study) {
    studiesApi.deleteStudy(study.studyId as number).then(listStudies);
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
          createStudy(options.data as Study);
        }
      },
    });
  }

  function onCopyId(studyId: number | undefined, title: string | undefined) {
    if (studyId) {
      const studyUrl = location.host + '/studies/' + studyId;
      navigator.clipboard.writeText(studyUrl).then(
        function () {
          console.log('Copied Study ' + title + ': ' + studyUrl);
        },
        function (error) {
          console.error('copy to clipboard error', error);
        }
      );

      dialog.open(InfoDialog, {
        data: {
          message:
            'URL for StudyId ' +
            studyId +
            ' Study (' +
            title +
            ') was copied to your clipboard.',
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
  listStudies().finally(() => loader.disable());

  const editAccessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];
</script>

<template>
  <div>
    <MoreTable
      row-id="studyId"
      :title="$t('dashboardTitle')"
      subtitle="This is the list of my own studies and studies where I am added as collaborator."
      :columns="studyColumnsDraft"
      :rows="studyList"
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
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

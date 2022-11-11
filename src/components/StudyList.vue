<script setup lang="ts">
import {ref, Ref} from 'vue'
import {useStudiesApi} from '../composable/useApi'
import {useRouter} from 'vue-router'
import {
  MoreTableAction,
  MoreTableColumn,
  MoreTableFieldType, MoreTableRowActionResult
} from '../models/MoreTableModel'
import {Study} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import DynamicDialog from 'primevue/dynamicdialog';
import StudyCreationDialog from './dialog/StudyCreationDialog.vue'
import {AxiosResponse} from 'axios';
import {useDialog} from 'primevue/usedialog';

const { studiesApi } = useStudiesApi()
  const studyList: Ref<Study[]> = ref([])
  const router = useRouter()
  const dialog = useDialog();

  const studyColumns: MoreTableColumn[] = [
    { field: 'studyId', header: 'id'},
    { field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    { field: 'status', header: 'status', sortable: true},
    { field: 'purpose', header: 'purpose', editable: true },
    { field: 'plannedStart', header: 'plannedStart', type: MoreTableFieldType.calendar, editable: true, sortable: true},
    { field: 'plannedEnd', header: 'plannedEnd', type: MoreTableFieldType.calendar, editable: true, sortable: true},
  ]

  const tableActions: MoreTableAction[] = [
    { id:'create', label:'Create Study' }
  ]

  const rowActions: MoreTableAction[] = [
    { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Delete Study', message: 'Deletion of a study can’t be revoked! Are you sure you want to delete following study: {{title}}'}}
  ]

  async function listStudies(): Promise<void> {
    try {
      studyList.value = []; //TODO necessary?
      studyList.value = await studiesApi.listStudies()
        .then((response:AxiosResponse) => response.data)
    } catch (e) {
      console.error('cannot list studies', e)
    }
  }

  async function createStudy(study: Study): Promise<void> {
    await studiesApi.createStudy(study).then(listStudies);
  }

  function goToStudy(id: string|unknown) {
    router.push({ name: 'Overview', params: { studyId: id as string } })
  }

  function execute(action: MoreTableRowActionResult<Study>) {
    switch (action.id) {
      case 'delete': return deleteStudy(action.row)
      case 'create': return openCreateDialog()
      default: console.error('no handler for action', action)
    }
  }

  function changeValue(study:Study) {
    study = study as Study;
    const i = studyList.value.findIndex(v => v.studyId === study.studyId);
    if(i>-1) {
      studyList.value[i] = study;
      studiesApi.updateStudy(study.studyId as number, study);
    }
  }

  function deleteStudy(study: Study) {
    studiesApi.deleteStudy(study.studyId as number).then(listStudies)
  }

  function openCreateDialog() {
    dialog.open(StudyCreationDialog,{
      props: {
        header: 'Create Study',
        style: {
          width: '50vw',
        },
        breakpoints:{
          '960px': '75vw',
          '640px': '90vw'
        },
        modal: true,
        dismissableMask: true,

      },
      onClose: (options) => {
        if(options) {
          createStudy(options.data as Study)
        }
      }
    })
  }

  listStudies()
</script>

<template>
  <div>
    <MoreTable
      row-id="studyId"
      :title="$t('studies')"
      :columns="studyColumns"
      :rows="studyList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :sort-options="{sortField: 'plannedStart', sortOrder: -1}"
      @onselect="goToStudy($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

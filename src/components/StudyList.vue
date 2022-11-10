<script setup lang="ts">
import {ref, Ref} from 'vue'
import {useStudiesApi} from '../composable/useApi'
import {useRouter} from 'vue-router'
import {
  MoreTableAction,
  MoreTableColumn,
  MoreTableFieldType, MoreTableRowActionResult, MoreTableFilterOption
} from '../models/MoreTableModel'
import {Study} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import {AxiosResponse} from 'axios';
import {FilterMatchMode, FilterOperator} from 'primevue/api';

const { studiesApi } = useStudiesApi()
  const studyList: Ref<Study[]> = ref([])
  const router = useRouter()

  const studyColumns: MoreTableColumn[] = [
    { field: 'studyId', header: 'id'},
    { field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    { field: 'status', header: 'status', sortable: true},
    { field: 'purpose', header: 'purpose', editable: true },
    { field: 'plannedStart', header: 'plannedStart', type: MoreTableFieldType.calendar, editable: true, sortable: true},
    { field: 'plannedEnd', header: 'plannedEnd', type: MoreTableFieldType.calendar, editable: true, sortable: true},
  ]

  const rowActions: MoreTableAction[] = [
    { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete study?'}}
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

  function goToStudy(id: string) {
    router.push({ name: 'Overview', params: { studyId: id } })
  }

  function execute(action: MoreTableRowActionResult<Study>) {
    switch (action.id) {
      case 'delete': return deleteStudy(action.row)
      default: console.error('no handler for action', action)
    }
  }

  function changeValue(study:Study) {
    const i = studyList.value.findIndex(v => v.studyId === study.studyId);
    if(i>-1) {
      studyList.value[i] = study;
      studiesApi.updateStudy(study.studyId as number, study);
    }
  }

  function deleteStudy(study: Study) {
    studiesApi.deleteStudy(study.studyId as number).then(listStudies)
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
      :sort-options="{sortField: 'plannedStart', sortOrder: -1}"
      @onselect="goToStudy($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

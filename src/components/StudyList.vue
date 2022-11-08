<script setup lang="ts">
import {ref, Ref} from 'vue'
import useStudiesApiClient from '../composable/useStudiesApi'
import {useRouter} from 'vue-router'
import {
  MoreTableAction,
  MoreTableActionResult,
  MoreTableColumn,
  MoreTableEditableType, MoreTableRowEditResult
} from '../models/MoreTableModel'
import {Study} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';

const { studyApi } = useStudiesApiClient()
  const studyList: Ref<Study[]> = ref([])
  const router = useRouter()

  const studyColumns: MoreTableColumn[] = [
    { field: 'title', header: 'title', editable: {type: MoreTableEditableType.string} },
    { field: 'purpose', header: 'purpose', editable: {type: MoreTableEditableType.string} },
    { field: 'plannedEnd', header: 'plannedEnd', editable: {type: MoreTableEditableType.calendar} },
    { field: 'plannedStart', header: 'plannedStart', editable: {type: MoreTableEditableType.calendar} },
    { field: 'status', header: 'status'},
  ]

  const rowActions: MoreTableAction[] = [
    { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete study?'}}
  ]

  async function listStudies(): Promise<void> {
    try {
      studyList.value = []; //TODO necessary?
      studyList.value = await studyApi.listStudies().then((response) => response.data);
    } catch (e) {
      console.error('cannot list studies', e)
    }
  }

  function goToStudy(id: string) {
    router.push({ name: 'Study', params: { studyId: id } })
  }

  function execute(action: MoreTableActionResult) {
    switch (action.id) {
      case 'delete': return deleteStudy(action.data as Study)
      default: console.error('no handler for action', action)
    }
  }

  function changeValue(value: MoreTableRowEditResult) {
    const i = studyList.value.findIndex(v => v.studyId === Number(value.rowId));
    if(i>-1) {
      const study = value.data as Study;
      studyList.value[i] = study;
      studyApi.updateStudy(study.studyId as number, study);
    }
  }

  function deleteStudy(study: Study) {
    studyApi.deleteStudy(study.studyId as number).then(listStudies)
  }

  listStudies()
</script>

<template>
  <div>
    <MoreTable
      row-id="studyId"
      :title="$t('studies')"
      :columns="studyColumns"
      :has-edit="false"
      :has-delete="false"
      :rows="studyList"
      :row-actions="rowActions"
      @onselect="goToStudy($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

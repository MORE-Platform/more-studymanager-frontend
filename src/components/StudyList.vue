<script setup lang="ts">
  import { ref, Ref } from 'vue'
  import useStudiesApiClient from '../composable/useStudiesApi'
  import { useRouter } from 'vue-router'
  import {MoreTableAction, MoreTableActionResult, MoreTableColumn} from '../models/MoreTableModel'
  import {Study} from '../generated-sources/openapi';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';

  const { studyApi } = useStudiesApiClient()
  const studyList: Ref<Study[]> = ref([])
  const router = useRouter()

  const studyColumns: MoreTableColumn[] = [
    { field: 'title', header: 'title' },
    { field: 'plannedStart', header: 'plannedStart' },
    { field: 'plannedEnd', header: 'plannedEnd' },
    { field: 'start', header: 'start' },
    { field: 'end', header: 'end' },
    { field: 'status', header: 'status' },
  ]

  const rowActions: MoreTableAction[] = [
    { id:'delete', label:'Delete', icon:'pi pi-times', confirm: {header: 'Confirm', message: 'Really delete study?'}}
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
    console.log(id);
    router.push({ name: 'Study', params: { id: id } })
  }

  function execute(action: MoreTableActionResult) {
    switch (action.id) {
      case 'delete': return deleteStudy(action.data as Study)
      default: console.error('no handler for action', action)
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
      :title="$t('studyList')"
      :columns="studyColumns"
      :has-edit="false"
      :has-delete="false"
      :data="studyList"
      :row-actions="rowActions"
      @onselect="goToStudy($event)"
      @onaction="execute($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

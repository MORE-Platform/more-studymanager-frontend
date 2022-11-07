<script setup lang="ts">
  import { ref, Ref } from 'vue'
  import useStudiesApiClient from '../composable/useStudiesApi'
  import { useRouter } from 'vue-router'
  import DatatableColumn from '../models/DatatableColumn'
  import {Study} from '../generated-sources/openapi';
  import MoreTable from './shared/MoreTable.vue';

  const { studyApi } = useStudiesApiClient()
  const studyList: Ref<Study[]> = ref([])
  const router = useRouter()

  const studyColumns: DatatableColumn[] = [
    { field: 'title', header: 'title' },
    { field: 'plannedStart', header: 'plannedStart' },
    { field: 'plannedEnd', header: 'plannedEnd' },
    { field: 'start', header: 'start' },
    { field: 'end', header: 'end' },
    { field: 'status', header: 'status' },
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
    router.push({ name: 'Study', params: { id: id } })
  }

  listStudies()
</script>

<template>
  <div>
    <MoreTable
      id=""
      :columns="studyColumns"
      :has-edit="false"
      :has-delete="false"
      :data="studyList"
      @onselect="goToStudy($event)"
    />
  </div>
</template>

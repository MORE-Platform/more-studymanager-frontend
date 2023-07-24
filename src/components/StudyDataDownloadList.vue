<script setup lang="ts">
  // import { useDataApi, useImportExportApi } from '../composable/useApi';
  import { useI18n } from 'vue-i18n';
  // import { useErrorHandling } from '../composable/useErrorHandling';
  import { MoreTableAction, MoreTableColumn } from '../models/MoreTableModel';
  import MoreTable from './shared/MoreTable.vue';
  import { PropType, ref, Ref } from 'vue';
  import { StudyRole } from '../generated-sources/openapi';
  import useLoader from '../composable/useLoader';

  //const { importExportApi } = useImportExportApi();
  //const { dataApi } = useDataApi();
  const { t } = useI18n();
  //const { handleIndividualError } = useErrorHandling();
  const loader = useLoader();

  defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    accessRoles: {
      type: Array as PropType<StudyRole[]>,
      required: true,
    },
  });

  const studyDataSnapshotList: Ref<any> = ref([]);

  function listStudyDataSnapshots(): any {
    studyDataSnapshotList.value = [];
    console.log('lsitStudyDataSnapshot');
    // use api to get studyDataSnapshotLists
  }

  const studyDataSnapshotColumns: MoreTableColumn[] = [
    {
      field: 'name',
      header: t('dataDownload.singular'),
      editable: false,
      sortable: true,
      filterable: true,
    },
    {
      field: 'timestamp',
      header: t('dataDownload.props.timestamp'),
      editable: false,
      sortable: true,
      filterable: false,
    },
    {
      field: 'status',
      header: t('dataDownload.props.status'),
      editable: false,
      sortable: true,
      filterable: false,
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'download',
      label: t('dataDownload.snapshotList.downloadSnapshot'),
      icon: 'pi pi-download',
      visible: () => true,
    },
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      icon: 'pi pi-plus',
      label: t('dataDownload.snapshotList.createSnapshot'),
      visible: () => true,
    },
  ];

  function execute(action: any) {
    switch (action.id) {
      case 'download':
        return downloadSnapshot();
      case 'create':
        return createSnapshot();
    }
  }

  function downloadSnapshot() {
    console.log('downloadSnapshot');
  }
  function createSnapshot() {
    console.log('createSnapshot');
  }

  listStudyDataSnapshots();
</script>

<template>
  <div class="study-data-download-list">
    <MoreTable
      :rows="studyDataSnapshotList"
      :columns="studyDataSnapshotColumns"
      row-id="studySnapshotId"
      :title="$t('dataDownload.snapshotList.title')"
      :subtitle="$t('dataDownload.snapshotList.description')"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :loading="loader.isLoading.value"
      :editable-access="false"
      :editable-user-roles="accessRoles"
      :empty-message="$t('dataDownload.snapshotList.emptyListMsg')"
      @onaction="execute($event)"
    />
  </div>
</template>

<style scoped lang="postcss"></style>

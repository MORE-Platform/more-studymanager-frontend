<script setup lang="ts">
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import { useComponentsApi, useDataApi } from '../composable/useApi';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { ref, Ref } from 'vue';
  import { ParticipationDataMapping } from '../models/ParticipationData';
  import { AxiosError } from 'axios';
  import {
    MoreTableColumn,
    MoreTableFieldType,
  } from '../models/MoreTableModel';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { ComponentFactory } from '../generated-sources/openapi';
  const { componentsApi } = useComponentsApi();

  const { dataApi } = useDataApi();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
  });

  const loader = useLoader();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();

  const participationDataListMapping: Ref<ParticipationDataMapping[]> = ref([]);

  async function listParticipationData(): Promise<void> {
    participationDataListMapping.value = await dataApi
      .getParticipationData(props.studyId)
      .then(async (response) => {
        return response.data.map((item) => {
          const mapping: ParticipationDataMapping = {
            participantAlias: item.participantNamedId?.title || '-',
            observationTitle:
              `${item.observationNamedId?.title} ${getObservationTypeLabel(
                item.observationType as string
              )}` || '-',
            studyGroupTitle:
              item.studyGroupNamedId?.title ||
              t('global.placeholder.entireStudy'),
            dataReceived: t(
              `global.labels.${
                item.dataReceived ? 'dataReceived' : 'noDataReceived'
              }`
            ),
            lastDataReceived: item.lastDataReceived
              ? item.lastDataReceived
              : '-',
          };
          return mapping;
        });
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participationDataList');
        return [];
      });
  }

  async function getFactories() {
    return componentsApi.listComponents('observation').then((response: any) => {
      return response.data;
    });
  }
  const factories: ComponentFactory[] = await getFactories();

  function getObservationTypeLabel(observationType: string) {
    return `(${
      factories.find((item) => item.componentId === observationType)?.title
    })`;
  }

  const studyDataColumns: MoreTableColumn[] = [
    {
      field: 'participantAlias',
      header: t('participants.singular'),
      editable: false,
      sortable: true,
      filterable: true,
    },
    {
      field: 'studyGroupTitle',
      header: t('study.props.studyGroup'),
      editable: false,
      sortable: true,
      filterable: true,
    },
    {
      field: 'observationTitle',
      header: t('observation.singular'),
      sortable: true,
      filterable: true,
    },
    {
      field: 'dataReceived',
      header: t('global.labels.dataReceived'),
      editable: false,
      sortable: true,
      filterable: true,
    },
    {
      field: 'lastDataReceived',
      header: t('global.labels.lastDataReceived'),
      editable: false,
      sortable: true,
      filterable: true,
      type: MoreTableFieldType.datetime,
    },
  ];

  listParticipationData();
</script>

<template>
  <div>
    <MoreTable
      row-id="observationId"
      :title="$t('data.title')"
      :subtitle="$t('data.description')"
      :columns="studyDataColumns"
      :rows="participationDataListMapping"
      :row-actions="[]"
      :row-edit-btn="false"
      :sort-options="{ sortField: 'lastDataReceived', sortOrder: -1 }"
      :editable="() => false"
      :loading="loader.isLoading.value"
      :empty-message="$t('data.dataList.emptyListMsg')"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

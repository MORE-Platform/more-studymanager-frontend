<script setup lang="ts">
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import { useComponentsApi, useDataApi } from '../composable/useApi';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { ref, Ref } from 'vue';
  import {
    ParticipationDataMapping,
  } from '../models/ParticipationData';
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
          console.log(item);
          const mapping: ParticipationDataMapping = {
            participantAlias: item.participantNamedId?.title || '-',
            observationId: item.observationNamedId?.id || -1,
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

  await listParticipationData();

  function setObservationGroups() {
    console.log('setObservationGroups');

    const tempObj = participationDataListMapping.value.reduce(function (r, a) {
      r[a.observationId] = r[a.observationId] || [];
      r[a.observationId].push(a);
      return r;
    }, Object.create(null));

    console.log(tempObj);

    return tempObj || {};
  }

  const test = setObservationGroups();
</script>

<template>
  <div>
    <div class="title mb-12">
      <h3 class="font-bold">{{ $t('data.title') }}</h3>
      <h4>{{ $t('data.description') }}</h4>
    </div>
    <div v-for="t in test" :key="t.observationId" class="mt-10">
      <MoreTable
        row-id="observationId"
        :title="t[0].observationTitle"
        :columns="studyDataColumns"
        :rows="t"
        :row-actions="[]"
        :row-edit-btn="false"
        :sort-options="{ sortField: 'lastDataReceived', sortOrder: -1 }"
        :editable="() => false"
        :loading="loader.isLoading.value"
        :empty-message="$t('data.dataList.emptyListMsg')"
      />
    </div>
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

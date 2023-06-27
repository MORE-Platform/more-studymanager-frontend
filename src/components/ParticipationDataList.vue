<script setup lang="ts">
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import { useComponentsApi, useDataApi } from '../composable/useApi';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { onMounted, ref, Ref } from 'vue';
  import {
    ParticipationDataGrouping,
    ParticipationDataMapping,
  } from '../models/ParticipationData';
  import { AxiosError } from 'axios';
  import {
    MoreTableColumn,
    MoreTableFieldType,
  } from '../models/MoreTableModel';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { ComponentFactory } from '../generated-sources/openapi';
  import Accordion from 'primevue/accordion';
  import AccordionTab from 'primevue/accordiontab';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';

  const { componentsApi } = useComponentsApi();
  const { dataApi } = useDataApi();
  const route = useRoute();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
  });

  const timer = ref();

  onMounted(() => {
    timer.value = setInterval(function () {
      if (route.name === 'Monitoring') {
        listParticipationData();
      }
    }, 10000);
  });

  onBeforeRouteLeave(() => {
    clearInterval(timer.value);
  });

  const loader = useLoader();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();

  const participationDataListMapping: Ref<ParticipationDataMapping[]> = ref([]);
  const groupedParticipantData: Ref<ParticipationDataGrouping> = ref({});

  async function listParticipationData(): Promise<void> {
    participationDataListMapping.value = await dataApi
      .getParticipationData(props.studyId)
      .then(async (response) => {
        return response.data.map((item) => {
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

  function getObservationGroups() {
    groupedParticipantData.value = participationDataListMapping.value.reduce(
      function (r, a) {
        r[a.observationId] = r[a.observationId] || [];
        r[a.observationId].push(a);
        return r;
      },
      Object.create(null)
    );
  }

  await listParticipationData();
  getObservationGroups();
</script>

<template>
  <div>
    <div class="title mb-12">
      <h3 class="font-bold">{{ $t('data.title') }}</h3>
      <div>{{ $t('data.description') }}</div>
    </div>
    <div>
      <Accordion
        :active-index="0"
        lazy
        expand-icon="pi pi-chevron-up"
        class="mt-5"
      >
        <AccordionTab
          v-for="observationData in groupedParticipantData"
          :key="observationData[0].observationId"
          :header="observationData[0].observationTitle as string"
          class="mt-10 mb-10"
        >
          <MoreTable
            v-if="observationData.length"
            row-id="observationId"
            :columns="studyDataColumns"
            :rows="observationData"
            :row-actions="[]"
            :row-edit-btn="false"
            :sort-options="{ sortField: 'lastDataReceived', sortOrder: -1 }"
            :editable="() => false"
            :loading="loader.isLoading.value"
            :empty-message="$t('data.dataList.emptyListMsg')"
          />
        </AccordionTab>
      </Accordion>
    </div>
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style scoped lang="postcss">
  :deep(.more-table) {
    .flex {
      margin: 0;
    }
  }
  :deep(.p-accordion-header) {
    margin-top: 1.2rem !important;

    a {
      padding: 0.5rem 0 1rem 0 !important;
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--primary-color) !important;
      border: transparent !important;
      border-bottom: 1px solid var(--surface-c) !important;
      background: transparent !important;

      &:focus,
      &:active {
        border: transparent !important;
      }
    }
    .p-accordion-toggle-icon {
      position: absolute;
      right: 0;
    }
  }
  :deep(.p-accordion-content) {
    border: transparent !important;
    padding: 0 !important;
  }
</style>

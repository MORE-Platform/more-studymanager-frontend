/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import { useComponentsApi, useDataApi } from '../composable/useApi';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { ref, Ref } from 'vue';
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
  import { onBeforeRouteLeave } from 'vue-router';
  import DatapointList from './subComponents/DatapointList.vue';

  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();
  const { componentsApi } = useComponentsApi();
  const { dataApi } = useDataApi();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
  });

  let timer: NodeJS.Timeout | number;

  function loadData() {
    timer ??= setInterval(function () {
      listParticipationData().then(setObservationGroups);
    }, 10000);
    listParticipationData().then(setObservationGroups);
  }

  onBeforeRouteLeave(() => {
    clearInterval(timer);
  });

  const groupedParticipantData: Ref<ParticipationDataGrouping> = ref({});

  async function listParticipationData(): Promise<ParticipationDataMapping[]> {
    return dataApi
      .getParticipationData(props.studyId)
      .then((response) =>
        response.data.map((item) => {
          return {
            participantId: item.participantNamedId?.id,
            participantAlias: item.participantNamedId?.title || '-',
            observationId: item.observationNamedId?.id || -1,
            observationTitle:
              `${item.observationNamedId?.title} ${getObservationTypeLabel(
                item.observationType as string,
              )}` || '-',
            studyGroupTitle:
              item.studyGroupNamedId?.title ||
              t('global.placeholder.entireStudy'),
            dataReceived: t(
              `global.labels.${
                item.dataReceived ? 'dataReceived' : 'noDataReceived'
              }`,
            ),
            lastDataReceived: item.lastDataReceived
              ? item.lastDataReceived
              : '-',
          };
        }),
      )
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participationDataList');
        return [];
      });
  }

  let factories: ComponentFactory[];

  function getObservationTypeLabel(observationType: string): string {
    const label = factories.find(
      (f) => f.componentId === observationType,
    )?.title;
    return label !== undefined ? t(label) : '';
  }

  const studyDataColumns: MoreTableColumn[] = [
    {
      field: 'participantId',
      header: t('global.labels.id'),
      editable: false,
      sortable: true,
    },
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

  function setObservationGroups(data: ParticipationDataMapping[]) {
    groupedParticipantData.value = data.reduce(function (prev, curr) {
      prev[curr.observationId] = prev[curr.observationId] || [];
      prev[curr.observationId].push(curr);
      return prev;
    }, Object.create(null));
  }

  componentsApi
    .listComponents('observation')
    .then((response: any) => response.data)
    .then((rsp) => (factories = rsp))
    .then(loadData);
</script>

<template>
  <div>
    <div class="title mb-12">
      <h3 class="font-bold">{{ $t('data.title') }}</h3>
      <div>{{ $t('data.description') }}</div>
    </div>
    <DatapointList :study-id="studyId" class="mb-14"></DatapointList>

    <div>
      <h4
        v-if="Object.keys(groupedParticipantData).length"
        class="color-primary mb-4 font-bold"
      >
        {{ $t('data.dataList.title') }}
      </h4>
      <Accordion :active-index="0" lazy expand-icon="pi pi-chevron-up">
        <AccordionTab
          v-for="observationData in groupedParticipantData"
          :key="observationData[0].observationId"
          :header="observationData[0].observationTitle as string"
          headerClass="mt-2.5"
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
    a {
      padding: 0.5rem 0 1rem 0 !important;
      font-size: 1.1rem;
      font-weight: normal;
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

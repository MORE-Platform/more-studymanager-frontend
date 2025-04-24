/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import Column from 'primevue/column';
  import Dropdown from 'primevue/dropdown';
  import DataTable from 'primevue/datatable';
  import { DataPoint } from '@gs/models';
  import { Ref, ref } from 'vue';
  import {
    useDataApi,
    useObservationsApi,
    useParticipantsApi,
  } from '../../composable/useApi';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  interface Option {
    name: string;
    value: number | undefined;
  }

  const { dataApi } = useDataApi();
  const { observationsApi } = useObservationsApi();
  const { participantsApi } = useParticipantsApi();
  const { t } = useI18n();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
  });

  const observations: Ref<Option[]> = ref([]);
  const participants: Ref<Option[]> = ref([]);

  const dataPoints: Ref<DataPoint[]> = ref([]);
  const size: Ref<number> = ref(3);
  const emptyOption: Option = {
    name: t('global.placeholder.all'),
    value: undefined,
  };
  const participant: Ref<Option> = ref(emptyOption);
  const observation: Ref<Option> = ref(emptyOption);

  let timer: ReturnType<typeof setInterval>;
  const refreshTimeInSeconds = 10;

  function loadData(): void {
    timer ??= ((): ReturnType<typeof setInterval> => {
      listDataPoints();
      return setInterval(listDataPoints, refreshTimeInSeconds * 1000);
    })();
  }

  onBeforeRouteLeave(() => {
    clearInterval(timer);
  });
  function listDataPoints(): void {
    dataApi
      .getDataPoints(
        props.studyId,
        size.value,
        observation.value.value,
        participant.value.value,
      )
      .then((r) => (dataPoints.value = r.data));
  }

  function formatDataPoints(property: any): string {
    let string = '';
    for (const prop in property) {
      string = `${string} ${prop}: ${property[prop]}${
        Object.keys(property)[Object.keys(property).length - 1] !== prop
          ? ','
          : ''
      }`;
    }
    return string;
  }

  function listObservations(): void {
    observationsApi
      .listObservations(props.studyId)
      .then((observation) =>
        observation.data.map(
          (observation) =>
            ({
              name: observation.title,
              value: observation.observationId,
            }) as Option,
        ),
      )
      .then((options) => (observations.value = [emptyOption, ...options]));
  }

  function listParticipants(): void {
    participantsApi
      .listParticipants(props.studyId)
      .then((participant) =>
        participant.data.map(
          (participant) =>
            ({
              name: participant.alias,
              value: participant.participantId,
            }) as Option,
        ),
      )
      .then((options) => (participants.value = [emptyOption, ...options]));
  }

  loadData();
  listObservations();
  listParticipants();
</script>

<template>
  <div>
    <div class="title mb-8">
      <h3 class="mb-1 font-bold">
        {{ $t('monitoring.dataPointsList.lastDatapoints') }}
      </h3>
      <div>
        {{ $t('monitoring.description', { duration: refreshTimeInSeconds }) }}
      </div>
    </div>

    <div class="datapoint-selection mb-3 flex gap-5">
      <div>
        {{ $t('monitoring.dataPointsList.resultSize') }}:
        <Dropdown
          v-model="size"
          :options="[1, 3, 10, 100]"
          :placeholder="$t('monitoring.placeholder.chooseSize')"
          class="small ml-1"
          @change="listDataPoints()"
        />
      </div>
      <div>
        {{ $t('participants.plural') }}:
        <Dropdown
          v-model="participant"
          option-label="name"
          :options="participants"
          :placeholder="$t('participants.placeholder.chooseParticipant')"
          class="ml-1"
          filter
          @change="listDataPoints()"
        />
      </div>
      <div>
        {{ $t('observation.plural') }}:
        <Dropdown
          v-model="observation"
          option-label="name"
          :options="observations"
          :placeholder="$t('observation.placeholder.chooseObservation')"
          class="ml-1"
          filter
          @change="listDataPoints()"
        />
      </div>
    </div>

    <DataTable :value="dataPoints">
      <Column field="observation" :header="$t('observation.singular')"></Column>
      <Column field="participantId" :header="$t('global.labels.id')"></Column>
      <Column
        field="participant"
        :header="$t('participants.singular')"
      ></Column>
      <Column field="time" :header="$t('global.labels.time')" sortable>
        <template #body="slotProps">
          {{ $d(new Date(slotProps['data']['time']), 'longSec') }}
        </template>
      </Column>
      <Column field="data" :header="$t('global.labels.data')">
        <template #body="slotProps">
          {{ formatDataPoints(slotProps['data']['data']) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="postcss">
  :deep(.p-dropdown) {
    min-width: 14rem;

    &.small {
      min-width: 5rem;
    }
  }
</style>

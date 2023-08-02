<script setup lang="ts">
  import Column from 'primevue/column';
  import Dropdown from 'primevue/dropdown';
  import DataTable from 'primevue/datatable';
  import { DataPoint } from '../../generated-sources/openapi';
  import { Ref, ref } from 'vue';
  import {
    useDataApi,
    useObservationsApi,
    useParticipantsApi,
  } from '../../composable/useApi';
  import { onBeforeRouteLeave } from 'vue-router';
  import dayjs from 'dayjs';

  interface Option {
    name: string;
    value: number | undefined;
  }

  const { dataApi } = useDataApi();
  const { observationsApi } = useObservationsApi();
  const { participantsApi } = useParticipantsApi();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
  });

  const observations: Ref<Option[]> = ref([]);
  const participants: Ref<Option[]> = ref([]);

  const dataPoints: Ref<DataPoint[]> = ref([]);
  const size: Ref<number> = ref(10);
  const emptyOption: Option = { name: 'All', value: undefined };
  const participant: Ref<Option> = ref(emptyOption);
  const observation: Ref<Option> = ref(emptyOption);

  let timer: NodeJS.Timer;

  function loadData() {
    timer ??= setInterval(function () {
      listDataPoints();
    }, 10000);
    listDataPoints();
  }

  onBeforeRouteLeave(() => {
    clearInterval(timer);
  });
  function listDataPoints() {
    dataApi
      .getDataPoints(
        props.studyId,
        size.value,
        observation.value.value,
        participant.value.value
      )
      .then((r) => (dataPoints.value = r.data));
  }

  function formatTime(property: string): string {
    return dayjs(property).format('DD/MM/YYYY, HH:mm:ss');
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

  function listObservations() {
    observationsApi
      .listObservations(props.studyId)
      .then((r) =>
        r.data.map((r) => ({ name: r.title, value: r.observationId } as Option))
      )
      .then((options) => (observations.value = [emptyOption, ...options]));
  }

  function listParticipants() {
    participantsApi
      .listParticipants(props.studyId)
      .then((r) =>
        r.data.map((r) => ({ name: r.alias, value: r.participantId } as Option))
      )
      .then((options) => (participants.value = [emptyOption, ...options]));
  }

  loadData();
  listObservations();
  listParticipants();
</script>

<template>
  <div class="title w-full">
    <h3 class="mb-1 font-bold">
      {{ $t('data.dataPointsList.lastDatapoints') }}
    </h3>
    <div class="datapoint-selection mb-3 flex gap-5">
      <div>
        {{ $t('data.dataPointsList.resultSize') }}:
        <Dropdown
          v-model="size"
          :options="[1, 3, 10, 100]"
          placeholder="Select a size"
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
          placeholder="Select a participant"
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
          placeholder="Select an observation"
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
          {{ formatTime(slotProps['data']['time']) }}
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

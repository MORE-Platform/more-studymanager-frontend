<script setup lang="ts">
  import Column from 'primevue/column';
  import Dropdown from 'primevue/dropdown';
  import DataTable from 'primevue/datatable';
  import {DataPoint} from '../../generated-sources/openapi';
  import {Ref, ref} from 'vue';
  import {useDataApi, useObservationsApi, useParticipantsApi} from '../../composable/useApi';
  import {onBeforeRouteLeave} from 'vue-router';

  interface Option {
    name: string;
    value: number|undefined;
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
  const emptyOption: Option = {name:'All', value:undefined};
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
      .getDataPoints(props.studyId, size.value, observation.value.value, participant.value.value)
      .then((r) => (dataPoints.value = r.data));
  }

  function listObservations() {
    observationsApi.listObservations(props.studyId)
      .then(r => r.data.map(r => ({name: r.title, value: r.observationId} as Option)))
      .then(options => observations.value = [emptyOption, ...options]);
  }

  function listParticipants() {
    participantsApi.listParticipants(props.studyId)
      .then(r => r.data.map(r => ({name: r.alias, value: r.participantId} as Option)))
      .then(options => participants.value = [emptyOption, ...options]);
  }

  loadData();
  listObservations();
  listParticipants();
</script>

<template>
  <div class="title w-full">
    <h3>Last Datapoints</h3>
    Size of Result: <Dropdown v-model="size" @change="listDataPoints()" :options="[1,3,10,100]" placeholder="Select a size" />
    Participants: <Dropdown v-model="participant" @change="listDataPoints()" optionLabel="name" :options="participants" placeholder="Select a participant" />
    Observations: <Dropdown v-model="observation" @change="listDataPoints()" optionLabel="name" :options="observations" placeholder="Select an observation" />
    <DataTable :value="dataPoints">
      <Column field="observation" header="Observation"></Column>
      <Column field="participant" header="Participant"></Column>
      <Column field="time" header="Time"></Column>
      <Column field="data" header="Data"></Column>
    </DataTable>
  </div>
</template>

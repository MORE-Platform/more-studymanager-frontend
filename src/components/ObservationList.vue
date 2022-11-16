<script setup lang="ts">
  import {ref,Ref} from 'vue'
  import {useObservationsApi} from "../composable/useApi";
  import {Observation, StudyGroup, StudyStatus} from '../generated-sources/openapi';
  import {MoreTableAction, MoreTableColumn, MoreTableRowActionResult} from "../models/MoreTableModel";

  const { observationsApi } = useObservationsApi();
  const observationList: Ref<Observation[]> = ref([])

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyStatus: { type: String, required: true}
  })

  const observationColumns: MoreTableColumn[] = [
    {field: 'type', header: 'type', sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'purpose', header: 'purpose', editable: true},
    {field: 'group', header: 'group', editable: true, sortable: true, filterable: {showFilterMatchModes: false}}
  ]

  const tableActions: MoreTableAction[] = [
    {id: 'create', icon: 'pi pi-plus', label: 'Add Observations'}
  ]

  const rowActions: MoreTableAction[] = [
    {id: 'clone', label: 'Clone', visible: (data) => props.studyStatus === StudyStatus.Draft || props.studyStatus === StudyStatus.Paused},
    {id: 'delete', label: 'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete study group?'},
      visible: (data) => props.studyStatus === StudyStatus.Draft}
  ]

  async function listObservations(): Promise<void> {
    console.log("listObservations");
    try {
      await observationsApi.listObservations(props.studyId)
        .then((response) => {
          console.log(response.data);
          console.log("list observations")
        })
    } catch(e) {
      console.error('cannot list observations', e);
    }
  }

  function execute(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete': return deleteObservation(action.row)
      case 'create': return createObservation()
      case 'clone': return cloneObservation(action.row)
      default: console.error('no handler for action', action)
    }
  }

  function changeValue(observation:Observation) {
    const i = observationList.value.findIndex(v => v.observationId === observation.observationId);
    if(i>-1) {
      observationList.value[i] = observation;
      observationsApi.updateObservation(props.studyId, observation.observationId as number, observation)
        .then(listObservations);
    }
  }

  function deleteObservation(observation: Observation) {
    console.log('to-do deleteObservation')
  }
  function cloneObservation(observation: Observation) {
    console.log('to-do cloneObservation')
  }
  function createObservation() {
    console.log('to-do createObservation')
  }

  listObservations();
</script>

<template>
  <div class="observation-list">
    <MoreTable
      row-id="observationId"
      :title="$t('observations')"
      :columns="observationColumns"
      :rows="observationList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      empty-message="No groups yet"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
  </div>
</template>

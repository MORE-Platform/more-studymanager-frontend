<script setup lang="ts">
import {PropType, ref, Ref} from 'vue'
import {useObservationsApi} from "../composable/useApi";
import {Observation, StudyGroup} from '../generated-sources/openapi';
import {MoreTableAction, MoreTableColumn, MoreTableFieldType, MoreTableRowActionResult, MoreTableChoice} from "../models/MoreTableModel";
import ConfirmDialog from 'primevue/confirmdialog';
import DynamicDialog from 'primevue/dynamicdialog';
import MoreTable from '../components/shared/MoreTable.vue'
import {AxiosResponse} from "axios";
//import {useDialog} from "primevue/usedialog";

const { observationsApi } = useObservationsApi();

  const observationList: Ref<Observation[]> = ref([])
  //const dialog = useDialog()
  //const loading = ref(true)

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true}
  })

  const groupStatuses: Ref<MoreTableChoice[]> = ref(
    props.studyGroups.map((item) => ({label: item.title, value: item.studyGroupId?.toString()} as MoreTableChoice))
  );

  const observationColumns: MoreTableColumn[]= [
    {field: 'type', header: 'type', sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'purpose', header: 'purpose', editable: true},
    {field: 'studyGroupId', header: 'group', type: MoreTableFieldType.choice, editable: true, sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'No group',
       choiceOptions: {statuses: groupStatuses.value, placeholder: 'groupChoice'}}
  ]

  const tableActions: MoreTableAction[] = [
    {id: 'create', icon: 'pi pi-plus', label: 'Add Observations'}
  ]

  const rowActions: MoreTableAction[] = [
    //{id: 'clone', label: 'Clone'},
    { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Delete Study',
        message: 'Deletion of an observation can’t be revoked! Are you sure you want to delete following observation: ...'}
    }
  ]

  async function listObservations(): Promise<void> {
    try {
      observationList.value = await observationsApi.listObservations(props.studyId)
        .then((response:AxiosResponse) => response.data)
    } catch (e) {
      console.error('cannot list studies', e)
    }
  }

  /*async function createObservations(observation: Observation): Promise<void> {
    await observationsApi.addObservation(props.studyId, observation)
      .then(listObservations)
  }

  function showObservation(id: string|unknown) {
   console.log(open edit dialog)
  }
  */

  function execute(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete': return deleteObservation(action.row)
      case 'create': return createObservation(action.row)
      //case 'clone': return cloneObservation(action.row)
      default: console.error('no handler for action', action)
    }
  }

  async function changeValue(observation:Observation) {
    try {
      //do change immediately (ux)
      const i = observationList.value.findIndex((o:Observation) => o.observationId === observation.observationId)
      if(i>-1) {
        observationList.value[i] = observation;
      }

      await observationsApi.updateObservation(props.studyId, observation.observationId as number, observation)
        .then(listObservations)
    }catch(e) {
      console.error("Couldn't update opservation " + observation.title);
    }

  }

  async function deleteObservation(requestObservation: Observation) {
    try {
      await observationsApi.deleteObservation(props.studyId, requestObservation.observationId as number)
        .then(listObservations)
    } catch (e) {
      console.error('Cannot delete observation ' + requestObservation.observationId, e)
    }
  }

  /*
  function cloneObservation(observation: Observation) {
    console.log('to-do cloneObservation')
  }
  */

  async function createObservation(newObservation: Observation) {
      try {
        await observationsApi.addObservation(props.studyId, newObservation)
          .then((response: AxiosResponse) => {
            console.log(response.data);
            console.log("observation api addObservation")
            listObservations()
          })
      } catch (e) {
        console.error('cannot create observation', e)
      }
  }

  /*
  const observation: Observation = {
    title: "string",
    purpose: "string",
    participantInfo: "string",
    type: "acc-mobile-observation",
    properties: {},
    schedule: {}
  }  */

  function openEditObservation(e: any) {
    console.log(e);
  }


  listObservations();
</script>

<template>
  <div class="observation-list">
    <MoreTable
      row-id="observationId"
      :title="$t('observations')"
      :subtitle="$t('observationListDescr')"
      :columns="observationColumns"
      :rows="observationList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :sort-options="{sortField: 'title', sortOrder: -1}"
      empty-message="No observations yet"
      @onselect="openEditObservation($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

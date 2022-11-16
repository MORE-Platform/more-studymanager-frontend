<script setup lang="ts">
import {ref, Ref} from 'vue'
import {useObservationsApi, useStudyGroupsApi} from "../composable/useApi";
import {Observation, StudyGroup, StudyStatus} from '../generated-sources/openapi';
import {MoreTableAction, MoreTableColumn, MoreTableFieldType, MoreTableRowActionResult, MoreTableChoice} from "../models/MoreTableModel";
import ConfirmDialog from 'primevue/confirmdialog';
import DynamicDialog from 'primevue/dynamicdialog';
import MoreTable from '../components/shared/MoreTable.vue'
import {useDialog} from "primevue/usedialog";

const { observationsApi } = useObservationsApi();
const { studyGroupsApi } = useStudyGroupsApi();

  const observationList: Ref<Observation[]> = ref([])
  const dialog = useDialog()
  const loading = ref(true)
  const studyGroupList: Ref<StudyGroup[]> = ref([])
  const groupStatuses: Ref<MoreTableChoice[]> =ref([])

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyStatus: { type: String, required: true}
  })

  async function getStudyGroups(): Promise<void> {
      try {
      await studyGroupsApi.listStudyGroups(props.studyId)
        .then((response) => {
          studyGroupList.value = response.data

          studyGroupList.value.forEach((item) => {
            if(item.title && item.studyGroupId) {
              const e:MoreTableChoice =  {
                label: item.title,
                value: item.studyGroupId.toString()
              }
              groupStatuses.value.push(e)
            }
          })
        })
      } catch(e) {
        console.error("'couldn't get list of study groups (observationList)", e);
      }
  }
  getStudyGroups();

  const observationColumns: Ref<MoreTableColumn[]> = ref([
    {field: 'type', header: 'type', sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'purpose', header: 'purpose', editable: true},
    {field: 'group', header: 'group', editable: true, sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'No groups available',
      type: MoreTableFieldType.choice, choiceOptions: {statuses: groupStatuses.value, placeholder: 'Choose a group'}}
  ])

  const tableActions: MoreTableAction[] = [
    {id: 'create', icon: 'pi pi-plus', label: 'Add Observations'}
  ]

  const rowActions: MoreTableAction[] = [
    {id: 'clone', label: 'Clone', visible: (data) => props.studyStatus === StudyStatus.Draft || props.studyStatus === StudyStatus.Paused},
    { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Delete Study',
        message: 'Deletion of an observation can’t be revoked! Are you sure you want to delete following observation: ...'},
      visible: (data) => props.studyStatus === StudyStatus.Draft
    }
  ]

  async function listObservations(): Promise<void> {
    console.log("listObservations");
    try {
      observationList.value = await observationsApi.listObservations(props.studyId)
        .then((response) => response.data)
    } catch(e) {
      console.error('cannot list observations', e);
    }
  }

  async function createObservations(observation: Observation): Promise<void> {
    await observationsApi.addObservation(props.studyId, observation)
      .then(listObservations)
  }

  function showObservation(id: string|unknown) {
    /*open edit dialog*/
  }

  function execute(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete': return deleteObservation(action.row)
      case 'create': return createObservation(action.row)
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

  async function deleteObservation(requestObservation: Observation) {
    try {
      await observationsApi.deleteObservation(props.studyId, requestObservation.observationId as number)
        .then(listObservations)
    } catch (e) {
      console.error('Cannot delete observation', e)
    }
  }

  function cloneObservation(observation: Observation) {
    console.log('to-do cloneObservation')
  }
  async function createObservation(newObservation: Observation) {
      try {
        await observationsApi.addObservation(props.studyId, newObservation)
          .then((response) => {
            console.log(response.data);
            console.log("observation api addObservation")
            listObservations()
          })
      } catch (e) {
        console.error('cannot create observation', e)
      }
  }

  function openEditObservation(e: any) {
    console.log(e);
  }


  listObservations();
</script>

<template>
  <div class="observation-list">
    <div>observationlist: {{observationList}}<br></div>
    <div>studyGroupList: {{studyGroupList}}<br></div>
    <div>groupStatuses: {{groupStatuses}}<br><br></div>
    <div>observationColumns: {{observationColumns}}</div>
    <MoreTable
      row-id="observationId"
      :title="$t('observations')"
      :subtitle="$t('observationListDescr')"
      :columns="observationColumns"
      :rows="observationList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :sort-options="{sortField: 'plannedStart', sortOrder: -1}"
      :editable="function(){studyStatus === StudyStatus.Draft || studyStatus === StudyStatus.Paused}"
      empty-message="No studies yet"
      @onselect="openEditObservation($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

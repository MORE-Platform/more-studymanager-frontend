<script setup lang="ts">
  import {ref, Ref, PropType} from 'vue'
  import {useInterventionsApi} from "../composable/useApi";
  import {Intervention, Observation, StudyGroup} from '../generated-sources/openapi';
  import {MoreTableAction, MoreTableColumn, MoreTableFieldType, MoreTableRowActionResult, MoreTableChoice} from "../models/MoreTableModel";
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue'
  import {AxiosResponse} from "axios";
  //import {useDialog} from "primevue/usedialog";
  //import InterventionsDialog from '../components/dialog/InterventionDialog.vue'

  const { interventionsApi } = useInterventionsApi();

  const interventionList: Ref<Intervention[]> = ref([])
  //const dialog = useDialog()
  //const interventionTypes: Ref<MoreTableActionOptions[]> = ref([])

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true}
  })

  const groupStatuses: Ref<MoreTableChoice[]> = ref(
    props.studyGroups.map((item) => ({label: item.title, value: item.studyGroupId?.toString()} as MoreTableChoice))
  );
  groupStatuses.value.push({label: 'No Groups', value: null});

  const interventionColumns: MoreTableColumn[] = [
    {field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'purpose', header: 'purpose', editable: true},
    {field: 'studyGroupId', header: 'group', type: MoreTableFieldType.choice, editable: true, sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'No group',
      choiceOptions: {statuses: groupStatuses.value, placeholder: 'groupChoice'}}
  ]

  const tableActions: MoreTableAction[] = [
    {id: 'create', icon: 'pi pi-plus', label: 'Add Interventions'}
  ]

  const rowActions: MoreTableAction[] = [
    { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Delete Study',
        message: 'Deletion of an observation can’t be revoked! Are you sure you want to delete following observation: ...'}
    }
  ]

  async function listInterventions(): Promise<void> {
    try {
      interventionList.value = await interventionsApi.listInterventions(props.studyId)
        .then((response:AxiosResponse) => response.data)
    } catch (e) {
      console.error('cannot list studies', e)
    }
  }

  function execute(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete': return deleteIntervention(action.row)
      //case 'create': return openInterventionDialog(action as MoreTableActionResult)
      default: console.error('no handler for action', action)
    }
  }

  async function changeValue(intervention:Intervention) {
    try {
      //do change immediately (ux)
      const i = interventionList.value.findIndex((o:Observation) => o.observationId === intervention.interventionId)
      if(i>-1) {
        interventionList.value[i] = intervention;
      }

      await interventionsApi.updateIntervention(props.studyId, intervention.interventionId as number, intervention)
        .then(listInterventions)
    }catch(e) {
      console.error("Couldn't update opservation " + intervention.title);
    }
  }

  /*async function createIntervention(newIntervention: Intervention) {
    try {
      await interventionsApi.addIntervention(props.studyId, newIntervention)
        .then((response: AxiosResponse) => {
          console.log(response.data);
          console.log("interventions api addIntervention")
          listInterventions()
        })
      } catch(e) {
        console.error("Cannot create intervention", e);
    }
  }   */
  /*
  const intervention: Intervention = {
    title: "test intervention",
    purpose: "test purpose",
    schedule: {},
    trigger: {},
    actions: [
      {
        type: "acc-mobile-observation",
        properties: {}
      }
    ]
  }
  createIntervention(intervention);  */

  async function deleteIntervention(requestIntervention: Intervention) {
    try {
      await interventionsApi.deleteIntervention(props.studyId, requestIntervention.interventionId as number)
        .then(listInterventions)
    } catch (e) {
      console.error('Cannot delete observation ' + requestIntervention.interventionId, e)
    }
  }

  /*function openInterventionDialog(actionResult: MoreTableActionResult) {
    console.log('openInterventionDialog')
  }  */

  listInterventions();

</script>

<template>
  <div class="interventions-list">
    <MoreTable
      row-id="interventionId"
      :title="$t('interventions')"
      :subtitle="$t('interrventionDescr')"
      :columns="interventionColumns"
      :rows="interventionList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :sort-options="{sortField: 'title', sortOrder: -1}"
      empty-message="No observations yet"
      @onselect="openInterventionDialog($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style lang="postcss">

</style>

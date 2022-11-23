<script setup lang="ts">
  import {ref, Ref, PropType} from 'vue'
  import {useInterventionsApi} from "../composable/useApi";
  import {useComponentsApi} from "../composable/useApi";
  import {Intervention, StudyGroup, Action, Trigger} from '../generated-sources/openapi';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableChoice,
    MoreTableActionOption,
    MoreTableActionOptions
  } from "../models/MoreTableModel";
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import MoreTable from '../components/shared/MoreTable.vue'
  import {AxiosResponse} from "axios";
  import {useDialog} from "primevue/usedialog";
  import InterventionDialog from '../components/dialog/InterventionDialog.vue'

  const { interventionsApi } = useInterventionsApi();
  const { componentsApi } = useComponentsApi();

  const interventionList: Ref<Intervention[]> = ref([])
  const dialog = useDialog()
  //const interventionTypes: Ref<MoreTableActionOptions[]> = ref([])

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true}
  })

  const groupStatuses = props.studyGroups.map((item) => ({label: item.title, value: item.studyGroupId?.toString()} as MoreTableChoice));
  groupStatuses.push({label: 'No Group', value: null})

  async function getObservationTypes() {
    return  componentsApi.listComponents("observation")
      .then((response:any) => response.data.map((item:any) => ({label: item.title, value: item.componentId})));
  }
  const observationTypes: MoreTableActionOption[] = await getObservationTypes();

  async function getActionTypes() {
    return  componentsApi.listComponents("action")
      .then((response:any) => response.data.map((item:any) => ({label: item.title, value: item.componentId})));
  }
  const interventionTypes: MoreTableActionOption[] = await getActionTypes();

  async function getTriggerTypes() {
    return componentsApi.listComponents("trigger")
      .then((response:any) => response.data.map((item:any) => ({label: item.title, value: item.componentId})));
  }
  const triggerTypes: MoreTableActionOptions[] = await getTriggerTypes();

  console.log("observationTypes");
  console.log(observationTypes);
  console.log("interventionTypes");
  console.log(interventionTypes);
  console.log("triggerTypes");
  console.log(triggerTypes);

  const interventionColumns: MoreTableColumn[] = [
    {field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'purpose', header: 'purpose', editable: true},
    { field: 'studyGroupId', header: 'group', type: MoreTableFieldType.choice, editable: {values: groupStatuses}, sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'noGroup'}
  ]

  const tableActions: MoreTableAction[] = [
    {id: 'create', icon: 'pi pi-plus', label: 'Add Intervention'}
  ]

  const rowActions: MoreTableAction[] = [
    {id: 'clone', label: 'Clone'},
    { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Delete Study',
        message: 'Deletion of an intervention can’t be revoked! Are you sure you want to delete following intervention: ...'}
    }
  ]

   function listInterventions(): void {
    interventionsApi.listInterventions(props.studyId)
      .then((response:AxiosResponse) => {
        interventionList.value = response.data;
      })
  }

  async function listActions(interventionId?: number) {
    if(interventionId) {
      return interventionsApi.listActions(props.studyId, interventionId)
        .then((response:any) => response.data)
    } else {
      return undefined
    }

  }
  async function getTrigger(interventionId?: number) {
    if(interventionId) {
      return interventionsApi.getTrigger(props.studyId, interventionId)
        .then((response: any) => response.data)
    } else {
      return undefined;
    }

  }

  function execute(action: MoreTableRowActionResult<StudyGroup>) {
    switch (action.id) {
      case 'delete': return deleteIntervention(action.row)
      case 'create': return openInterventionDialog('Create Intervention')
      case 'clone': return openInterventionDialog('Clone Intervention', action.row, true)
      default: console.error('no handler for action', action)
    }
  }

  async function changeValue(intervention:Intervention) {
    try {
      //do change immediately (ux)
      const i = interventionList.value.findIndex((i:Intervention) => i.interventionId === intervention.interventionId)
      if(i>-1) {
        interventionList.value[i] = intervention;
      }

      await interventionsApi.updateIntervention(props.studyId, intervention.interventionId as number, intervention)
        .then(listInterventions)
    } catch(e) {
      console.error("Couldn't update opservation " + intervention.title);
    }
  }

  async function deleteIntervention(requestIntervention: Intervention) {
    try {
      await interventionsApi.deleteIntervention(props.studyId, requestIntervention.interventionId as number)
        .then(listInterventions)
    } catch (e) {
      console.error('Cannot delete intervention ' + requestIntervention.interventionId, e)
    }
  }

  async function createIntervention(object: any) {
    console.log(object)


    /*
    try {
      await interventionsApi.addIntervention(props.studyId, newIntervention)
        .then(() => listInterventions())
      } catch(e) {
        console.error("Cannot create intervention", e);
    }
    */

  }



  async function updateIntervention(intervention: Intervention) {
    try {
      const i = interventionList.value.findIndex(v => v.interventionId === intervention.interventionId);
      if(i>-1) {
        interventionList.value[i] = intervention;
        await interventionsApi.updateIntervention(props.studyId, intervention.interventionId as number, intervention)
          .then(listInterventions)
      }
    } catch(e) {
      console.error('Cannot update intervention: ' + intervention.interventionId, e);
    }
  }

  function openEditIntervetion(interventionId: number) {
    const intervention = interventionList.value.find(i => i.interventionId === interventionId);
    if(intervention) {
      openInterventionDialog('Edit intervention', intervention);
    }
  }

  /*function nameForType(type?: string) {
    return observationTypes.find(t => t.value === type)?.label || type;
  } */

  async function openInterventionDialog(headerText: string, intervention?: Intervention, clone?: boolean) {
    console.log('openInterventionDialog')
    dialog.open(InterventionDialog, {
      data: {
        groupStates: groupStatuses,
        intervention: intervention,
        actions: await listActions(intervention?.interventionId),
        trigger: await getTrigger(intervention?.interventionId),
        actionTypes: await getActionTypes(),
        triggerTypes: await getTriggerTypes()
      },
      props: {
        header: headerText,
        style: {
          width: '50vw',
        },
        breakpoints:{
          '960px': '75vw',
          '640px': '90vw'
        },
        modal: true,
        dismissableMask: true,
      },
      onClose: (options) => {
        console.log(options);
        console.log("options");
        if(options?.data) {
          if(options.data?.interventionId) {
            if(clone) {
              createIntervention(options.data)
            } else {
              updateIntervention(options.data)
            }
          } else {
            createIntervention(options.data)
          }
        }
      }
    })
  }

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
      empty-message="No interventions yet"
      @onselect="openEditIntervetion($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style lang="postcss">

</style>

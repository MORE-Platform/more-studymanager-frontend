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

  async function getActionTypes() {
    return  componentsApi.listComponents("action")
      .then((response:any) => response.data.map((item:any) => ({label: item.title, value: item.componentId, description: item.description})));
  }
  async function getTriggerTypes() {
    return componentsApi.listComponents("trigger")
      .then((response:any) => response.data.map((item:any) => ({label: item.title, value: item.componentId, description: item.description})));
  }

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
    const interventionId: Ref<number | undefined> = ref(await addIntervention(object.intervention))

    if(interventionId.value) {

      await updateTrigger(interventionId.value, object.trigger)
        .then(() => {
          listInterventions()
        })

      object.actions.forEach((action: Action) => {
        if(action.actionId) {
          updateAction(interventionId.value as number, action.actionId, action)
        } else {
          createAction(interventionId.value as number, action)
        }
      })
    }
  }

  async function addIntervention(intervention: Intervention) {
    try {
      return interventionsApi.addIntervention(props.studyId, intervention)
        .then((response: AxiosResponse) => response.data.interventionId)
    } catch(e) {
      console.error("Cannot create intervention", e);
    }
  }

  async function createAction(interventionId: number, action: Action) {
    try {
      await interventionsApi.createAction(props.studyId, interventionId, action)
        .then(listInterventions)
    } catch(e) {
      console.error('Cannot create action on: ' + interventionId, e)
    }
  }

  async function updateAction(interventionId: number, actionId: number, action: Action) {
    try {
      await interventionsApi.updateAction(props.studyId, interventionId, actionId, action)
    } catch(e) {
      console.error('Cannot update action: ' + action.actionId, e);
    }
  }

  async function updateTrigger(interventionId: number, trigger: Trigger) {
    try {
      await interventionsApi.updateTrigger(props.studyId, interventionId, trigger)
    }catch(e) {
      console.error('Cannot create trigger on: ' + interventionId, e)
    }
  }

  async function updateInterventionData(object: any) {
    await updateIntervention(object.intervention)

    if(object.intervention.interventionId) {
      await updateTrigger(object.intervention.interventionId, object.trigger)
        .then(() => {
          listInterventions()
        })

      object.actions.forEach((action: Action) => {
        if(action.actionId) {
          updateAction(object.intervention.interventionId as number, action.actionId, action)
        } else {
          createAction(object.intervention.interventionId as number, action)
        }
      })
    }
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

   function openInterventionDialog(headerText: string, intervention?: Intervention, clone?: boolean) {
    Promise.all([listActions(intervention?.interventionId), getTrigger(intervention?.interventionId), getActionTypes(), getTriggerTypes()])
      .then(([actionsRes, triggerRes, actionTypesRes, triggerTypesRes]) => {
        dialog.open(InterventionDialog, {
          data: {
            groupStates: groupStatuses,
            intervention: intervention,
            studyId: props.studyId,
            actionsData: actionsRes,
            actionTypes: actionTypesRes,
            triggerData: triggerRes,
            triggerTypes: triggerTypesRes
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
            if(options?.data) {
              if(options.data?.intervention.interventionId) {
                if(clone) {
                  createIntervention(options.data)
                } else {
                  updateInterventionData(options.data)
                }
              } else {
                createIntervention(options.data)
              }
            }
          }
        })
     }).catch(console.error)


  }

  listInterventions();

</script>

<template>
  <div class="interventions-list">
    <MoreTable
      row-id="interventionId"
      :title="$t('interventions')"
      :subtitle="$t('interventionListDescr')"
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

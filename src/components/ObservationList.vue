<script async setup lang="ts">
import {ref, Ref, PropType} from 'vue'
import {useObservationsApi, useComponentsApi} from "../composable/useApi";
import {Observation, StudyGroup} from '../generated-sources/openapi';
import {
  MoreTableAction,
  MoreTableColumn,
  MoreTableFieldType,
  MoreTableChoice,
  MoreTableActionOption
} from "../models/MoreTableModel";
import ConfirmDialog from 'primevue/confirmdialog';
import DynamicDialog from 'primevue/dynamicdialog';
import MoreTable from '../components/shared/MoreTable.vue'
import {AxiosResponse} from "axios";
import {useDialog} from "primevue/usedialog";
import ObservationDialog from '../components/dialog/ObservationDialog.vue'

const { observationsApi } = useObservationsApi();
const { componentsApi } = useComponentsApi();

  const observationList: Ref<Observation[]> = ref([])
  const dialog = useDialog()
  //const loading = ref(true)
  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true}
  })

  const groupStatuses = props.studyGroups.map((item) => ({label: item.title, value: item.studyGroupId?.toString()} as MoreTableChoice));
  groupStatuses.push({label: 'No Group', value: null})

  async function getObservationTypes() {
    return  componentsApi.listComponents("observation")
      .then((response:any) => response.data.map((item:any) => ({label: item.title, value: item.componentId, description: item.description})));
  }

  const observationTypes: MoreTableActionOption[] = await getObservationTypes();

  const observationColumns: MoreTableColumn[]= [
    {field: 'type', header: 'type', sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'title', header: 'title', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
    {field: 'purpose', header: 'purpose', editable: true},
    { field: 'studyGroupId', header: 'group', type: MoreTableFieldType.choice, editable: {values: groupStatuses}, sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'noGroup'}
  ]

  const tableActions: MoreTableAction[] = [
    {id: 'create', icon: 'pi pi-plus', label: 'Add Observation', options: {type: 'menu', values: observationTypes}}
  ]

  const rowActions: MoreTableAction[] = [
    {id: 'clone', label: 'Clone'},
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

  function execute(action: any) {
    switch (action.id) {
      case 'delete': return deleteObservation(action.row)
      case 'create': return openObservationDialog('Create Observation', {type: action.properties})
      case 'clone': return openObservationDialog('Clone Observation', action.row, 'clone')
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

  function nameForType(type?: string) {
    return observationTypes.find(t => t.value === type)?.label || type;
  }

  function openObservationDialog(headerText: string, observation?: Observation, typeText?: string) {
    dialog.open(ObservationDialog,{
      data: {
        groupStates: groupStatuses,
        observation: observation,
        typeName: nameForType(observation?.type),
        observationTypes: observationTypes
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
          if(options.data?.observationId) {
            if(typeText) {
              createObservation(options.data as Observation)
            } else {
              updateObservation(options.data as Observation)
            }
          } else {
            createObservation(options.data as Observation)
          }
        }
      }
    })
  }


  function createObservation(newObservation: Observation) {
    try {
      observationsApi.addObservation(props.studyId, newObservation)
          .then(listObservations)
      } catch (e) {
        console.error('cannot create observation', e)
      }
  }

  async function updateObservation(observation: Observation) {
    console.log("updateObservation");
    try {
      const i = observationList.value.findIndex(v => v.observationId === observation.observationId);
      if(i>-1) {
        observationList.value[i] = observation;
        await observationsApi.updateObservation(props.studyId, observation.observationId as number, observation)
          .then(listObservations)
      }
    } catch(e) {
       console.error("Couldn't update observation", e);
    }
  }

  function openEditObservation(observationId: number) {
    const observation = observationList.value.find(o => o.observationId === observationId);
    if(observation) {
      openObservationDialog('Edit observation', observation);
    }
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

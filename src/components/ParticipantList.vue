<script setup lang="ts">
import {PropType, ref, Ref} from 'vue'
import {useParticipantsApi} from '../composable/useApi'
import {
  MoreTableAction, MoreTableActionResult, MoreTableChoice,
  MoreTableColumn, MoreTableFieldType, MoreTableRowActionResult,
} from '../models/MoreTableModel'
import {Participant, StudyGroup, StudyStatus} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';
// @ts-ignore
import * as names from 'starwars-names';

const { participantsApi } = useParticipantsApi()
const participantsList: Ref<Participant[]> = ref([])
const loading = ref(true)

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
  statusStatus: {
    type: Object as PropType<StudyStatus>,
    required: true
  },
  studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true}
});

const groupStatuses: Ref<MoreTableChoice[]> = ref(
  props.studyGroups.map((item) => ({label: item.title, value: item.studyGroupId?.toString()} as MoreTableChoice))
);

const participantsColumns: MoreTableColumn[] = [
  { field: 'alias', header: 'alias', editable: true, sortable: true, filterable: {showFilterMatchModes: false}},
  { field: 'registrationToken', header: 'token' },
  { field: 'status', header: 'status', filterable: {showFilterMatchModes: false} },
  { field: 'studyGroupId', header: 'group', type: MoreTableFieldType.choice, editable: {values: groupStatuses.value}, sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'No group'}
]

const rowActions: MoreTableAction[] = [
  { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete participant?'}}
]

const tableActions: MoreTableAction[] = [
  { id: 'distribute', label:'Distribute Participants', visible: () => {
    return props.statusStatus === StudyStatus.Draft || props.statusStatus === StudyStatus.Paused
    }},
  { id:'create', label:'Add Participant', icon:'pi pi-plus',
    options: {
      type: 'split',
      values: [{label: "Add 3", value: 3},{label: "Add 10", value: 10},{label: "Add 25", value: 25},{label: "Add 50", value: 50}]
    }}
]

async function listParticipant(): Promise<void> {
  loading.value = true;
  try {
    participantsList.value = await participantsApi.listParticipants(props.studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot list participants', e)
  } finally {
    loading.value = false;
  }
}

function distributeGroups():void {
  // copy participants and shuffle list
  const participantCopy = shuffleArray(participantsList.value.map((p) => JSON.parse(JSON.stringify(p))));
  // set group
  for (let i = 0; i < participantCopy.length; i++) {
    for(let j = 0; j < props.studyGroups.length; j++) {
        if(i < participantCopy.length) {
          participantCopy[i].studyGroupId = props.studyGroups[j].studyGroupId
          if(j < props.studyGroups.length-1) i++;
        } else break;
    }
  }
  participantsApi.updateParticipantList(props.studyId, participantCopy)
    .then(response => response.data)
    .then(ps => participantsList.value = ps);
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function shuffleArray(a: Participant[]) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function execute(action: MoreTableRowActionResult<Participant>|MoreTableActionResult) {
  switch (action.id) {
    case 'delete': return deleteParticipant((action as MoreTableRowActionResult<Participant>).row)
    case 'create': return createParticipant(action as MoreTableActionResult)
    case 'distribute': return distributeGroups()
    default: console.error('no handler for action', action)
  }
}

function createParticipant(actionResult: MoreTableActionResult) {
  const i = actionResult.properties || 1;
  const participants = names.random(i).map((alias:string) => ({alias, studyId: props.studyId}))
  participantsApi.createParticipants(props.studyId,participants).then(listParticipant)
}

function changeValue(participant:Participant) {
  const i = participantsList.value.findIndex(v => v.participantId === participant.participantId);
  if(i>-1) {
    participantsList.value[i] = participant;
    participantsApi.updateParticipant(participant.studyId as number, participant.participantId as number, participant);
  }
}

function deleteParticipant(participant:Participant) {
  participantsApi.deleteParticipant(participant.studyId as number, participant.participantId as number).then(listParticipant)
}

listParticipant()
</script>

<template>
  <div>
    <MoreTable
      row-id="participantId"
      :sort-options="{sortField: 'alias', sortOrder: 1}"
      :title="$t('participants')"
      :subtitle="$t('listDescription.participantList')"
      :columns="participantsColumns"
      :rows="participantsList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :loading="loading"
      empty-message="No participants yet"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<style lang="postcss">
.table-value-status-new {
  display: block;
  margin: 0.063rem 0.188rem 0 0;
  //padding-left: 1.2rem;
  //color: var(--primary-color);
  position: relative;

  /*&:before {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    content: "";
    display: inline-block;
    width: 0.938rem;
    height: 0.938rem;
    margin-right: 0.313rem;
    background: var(--primary-color);
  } */
}
</style>

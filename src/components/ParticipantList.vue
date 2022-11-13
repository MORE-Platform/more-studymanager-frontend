<script setup lang="ts">
import {ref, Ref} from 'vue'
import {useParticipantsApi} from '../composable/useApi'
import {
  MoreTableAction, MoreTableActionResult,
  MoreTableColumn, MoreTableRowActionResult,
} from '../models/MoreTableModel'
import {Participant} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';
// @ts-ignore
import * as names from 'starwars-names';

const { participantsApi } = useParticipantsApi()
const participantsList: Ref<Participant[]> = ref([])

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
});

const participantsColumns: MoreTableColumn[] = [
  { field: 'alias', header: 'alias', editable: true },
  { field: 'registrationToken', header: 'token' },
  { field: 'status', header: 'status' },
  { field: 'studyGroupId', header: 'group' }
]

const rowActions: MoreTableAction[] = [
  { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete participant?'}}
]

const tableActions: MoreTableAction[] = [
  { id:'create', label:'Add Participant', icon:'pi pi-plus',
    options: [{label: "Add 3", value: 3},{label: "Add 10", value: 10},{label: "Add 25", value: 25},{label: "Add 50", value: 50}]}
]

async function listParticipant(): Promise<void> {
  try {
    participantsList.value = await participantsApi.listParticipants(props.studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot list participants', e)
  }
}

function execute(action: MoreTableRowActionResult<Participant>|MoreTableActionResult) {
  switch (action.id) {
    case 'delete': return deleteParticipant((action as MoreTableRowActionResult<Participant>).row)
    case 'create': return createParticipant(action as MoreTableActionResult)
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
      :title="$t('participants')"
      :columns="participantsColumns"
      :rows="participantsList"
      :row-actions="rowActions"
      :table-actions="tableActions"
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
  margin: 1px 3px 0px 0px;
  color: blue;

  &:before {
    content: "";
    display: inline-block;
    width: 15px;
    height: 15px;
    margin-right: 5px;
    background: blue;
  }
}
</style>

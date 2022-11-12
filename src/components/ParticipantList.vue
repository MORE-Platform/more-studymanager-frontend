<script setup lang="ts">
import {ref, Ref} from 'vue'
import {useParticipantsApi} from '../composable/useApi'
import {useRouter} from 'vue-router'
import {
  MoreTableAction,
  MoreTableColumn, MoreTableRowActionResult,
} from '../models/MoreTableModel'
import {Participant, StudyGroup} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';

const { participantsApi } = useParticipantsApi()
const participantsList: Ref<Participant[]> = ref([])
const router = useRouter()

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
});

const participantsColumns: MoreTableColumn[] = [
  { field: 'alias', header: 'Alias', editable: true },
  { field: 'registrationToken', header: 'Token' },
  { field: 'status', header: 'Status' },
  { field: 'studyGroupId', header: 'Group' }
]

const rowActions: MoreTableAction[] = [
  { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete participant?'}}
]

const tableActions: MoreTableAction[] = [
  { id:'create', label:'Add Participant', icon:'pi pi-plus'}
]

async function listParticipant(): Promise<void> {
  try {
    participantsList.value = await participantsApi.listParticipants(props.studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot list participants', e)
  }
}

function execute(action: MoreTableRowActionResult<Participant>) {
  switch (action.id) {
    case 'delete': return deleteParticipant(action.row)
    case 'create': return createParticipant()
    default: console.error('no handler for action', action)
  }
}

function createParticipant() {
  //TODO
  participantsApi.createParticipants(props.studyId,[{studyId: props.studyId}]).then(listParticipant)
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

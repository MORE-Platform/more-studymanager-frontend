<script setup lang="ts">
import {ref, Ref} from 'vue'
import {useStudyGroupsApi} from '../composable/useApi'
import {useRouter} from 'vue-router'
import {
  MoreTableAction,
  MoreTableColumn, MoreTableRowActionResult,
} from '../models/MoreTableModel'
import {StudyGroup} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';

const { studyGroupsApi } = useStudyGroupsApi()
const studyGroupList: Ref<StudyGroup[]> = ref([])
const router = useRouter()

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
});

const studyGroupColumns: MoreTableColumn[] = [
  { field: 'title', header: 'title', editable: true },
  { field: 'purpose', header: 'purpose', editable: true }
]

const rowActions: MoreTableAction[] = [
  { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete study group?'}}
]

const tableActions: MoreTableAction[] = [
  { id:'create', label:'Create Group'}
]

async function listStudyGroups(): Promise<void> {
  try {
    studyGroupList.value = await studyGroupsApi.listStudyGroups(props.studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot list studies', e)
  }
}

function execute(action: MoreTableRowActionResult<StudyGroup>) {
  switch (action.id) {
    case 'delete': return deleteStudyGroup(action.row)
    case 'create': return createStudyGroup()
    default: console.error('no handler for action', action)
  }
}

function createStudyGroup() {
  studyGroupsApi.createStudyGroup(props.studyId,{studyId: props.studyId}).then(listStudyGroups)
}

function changeValue(studyGroup:StudyGroup) {
  const i = studyGroupList.value.findIndex(v => v.studyGroupId === studyGroup.studyGroupId);
  if(i>-1) {
    studyGroupList.value[i] = studyGroup;
    studyGroupsApi.updateStudyGroup(studyGroup.studyId as number, studyGroup.studyGroupId as number, studyGroup);
  }
}

function deleteStudyGroup(studyGroup: StudyGroup) {
  studyGroupsApi.deleteStudyGroup(studyGroup.studyId as number, studyGroup.studyGroupId as number).then(listStudyGroups)
}

listStudyGroups()
</script>

<template>
  <div>
    <MoreTable
      row-id="studyGroupId"
      :title="$t('studyGroups')"
      :columns="studyGroupColumns"
      :rows="studyGroupList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      empty-message="No groups yet"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

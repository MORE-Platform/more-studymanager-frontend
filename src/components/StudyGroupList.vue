<script setup lang="ts">
import {ref, Ref} from 'vue'
import {useStudyGroupsApi} from '../composable/useApi'
import {useRouter} from 'vue-router'
import {
  MoreTableAction,
  MoreTableActionResult,
  MoreTableColumn,
  MoreTableEditableType, MoreTableRowEditResult
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
  { field: 'title', header: 'title', editable: {type: MoreTableEditableType.string} },
  { field: 'purpose', header: 'purpose', editable: {type: MoreTableEditableType.string} }
]

const rowActions: MoreTableAction[] = [
  { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete study group?'}}
]

async function listStudyGroups(): Promise<void> {
  try {
    studyGroupList.value = []; //TODO necessary?
    studyGroupList.value = await studyGroupsApi.listStudyGroups(props.studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot list studies', e)
  }
}

function goToStudyGroup(groupId: string) {
  router.push({ name: 'StudyGroup', params: { studyId: props.studyId, groupId } })
}

function execute(action: MoreTableActionResult<StudyGroup>) {
  switch (action.id) {
    case 'delete': return deleteStudyGroup(action.data)
    default: console.error('no handler for action', action)
  }
}

function changeValue(value: MoreTableRowEditResult) {
  const i = studyGroupList.value.findIndex(v => v.studyGroupId === Number(value.rowId));
  if(i>-1) {
    const studyGroup = value.data as StudyGroup;
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
      @onselect="goToStudyGroup($event)"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import {Ref} from 'vue'
import {useStudyGroupsApi} from '../composable/useApi'
import {
  MoreTableAction,
  MoreTableColumn, MoreTableRowActionResult,
} from '../models/MoreTableModel'
import {StudyGroup} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';

const { studyGroupsApi } = useStudyGroupsApi()
const route = useRoute()
const {t} = useI18n();
const studyGroupList: Ref<StudyGroup[]> = route.meta['studyGroups'] as Ref<StudyGroup[]>;

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
});

const studyGroupColumns: MoreTableColumn[] = [
  { field: 'title', placeholder: 'Set a title', header: 'title', editable: true },
  { field: 'purpose', header: 'purpose', editable: true, placeholder: 'Set a proper purpose for this group' }
]

const rowActions: MoreTableAction[] = [
  { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete study group?'}}
]

const tableActions: MoreTableAction[] = [
  { id:'create', label:'Create Group', icon: 'pi pi-plus'}
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

function getTitle() {
  let title = undefined;
  let count = studyGroupList.value.length;
  while(title === undefined) {
    count += 1;
    const _title = t('group') + ' ' + count;
    if(!studyGroupList.value.find(g => g.title === _title)) {
      title = _title;
    }
  }
  return title;
}

function createStudyGroup() {
  studyGroupsApi.createStudyGroup(props.studyId,{studyId: props.studyId, title: getTitle()}).then(listStudyGroups)
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

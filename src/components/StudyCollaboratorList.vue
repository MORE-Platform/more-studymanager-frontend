<script setup lang="ts">
import {Ref, ref} from 'vue'
import {useStudyGroupsApi} from '../composable/useApi'
import {useUsersApi} from "../composable/useApi";
import {useCollaboratorsApi} from "../composable/useApi";
import {
  MoreTableAction, MoreTableChoice,
  MoreTableColumn, MoreTableFieldType, MoreTableRoleTypes, MoreTableRowActionResult,
} from '../models/MoreTableModel'
import {StudyGroup, Collaborator, CollaboratorDetails, Study, StudyRole, UserInfo} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {AxiosResponse} from "axios";

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
});


const { collaboratorsApi } = useCollaboratorsApi()
const { usersApi } = useUsersApi();
const { studyGroupsApi } = useStudyGroupsApi()
const route = useRoute()
const {t} = useI18n();
const studyGroupList: Ref<StudyGroup[]> = route.meta['studyGroups'] as Ref<StudyGroup[]>;

const collaboratorsList: Ref<Collaborator[]> = ref([]);
const collaboratorRoles: Ref<CollaboratorDetails[]> = ref([]);


const collaboratorColumns: MoreTableColumn[] = [
  {field: 'name', header: 'Name', sortable: true, filterable: {showFilterMatchModes: false}},
  {field: 'institution', header: 'Organisation', sortable: true, filterable: {showFilterMatchModes: false}},
  {field: 'email', header: 'E-Mail', sortable: true},
  { field: 'roles', header: 'Role(s)', type: MoreTableFieldType.multiselect,
    editable: {values: [
      {label: 'Study Administrator', value: StudyRole.Admin},
        {label: 'Study Operator', value: StudyRole.Operator},
        {label: 'Study Viewer', value: StudyRole.Viewer},
        {label: 'Delete Collaborator', value: null}]},
    sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'choose Role'}

]

console.log("collaboratorColumns------")
console.log(collaboratorColumns)
console.log(collaboratorColumns[3].editable)


const rowActions: MoreTableAction[] = [
  { id:'delete', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete study group?'}}
]

const tableActions: MoreTableAction[] = [
  { id:'create', label:'Add Collaborator', icon: 'pi pi-plus'}
]

function execute(action: MoreTableRowActionResult<CollaboratorDetails>) {
  switch (action.id) {
    case 'delete': return deleteStudyCollaborator(action.row)
    case 'create': return addStudyCollaborator(action.row)
    default: console.error('no handler for action', action)
  }
}

async function listCollaborators() {
  try {
     await collaboratorsApi.listStudyCollaborators(props.studyId)
      .then(
        (response: AxiosResponse) => {
          console.log(response.data);
          console.log("collaboratorsApi.llistStudyCollaborators");
          collaboratorsList.value = response.data.map((item) => ({uid: item.user.uid, name: item.user.name, institution: item.user.institution, email: item.user.email, roles: item.roles}))
          //return response.data
        });
  } catch(e) {
    console.error('Cannot list collaborators: ' + props.studyId, e);
  }
}

async function getStudyCollaboratorRoles() {
  console.log("getStudyCollaboratorRoles")
  console.log(props.studyId)
  console.log(typeof props.studyId)
  try {
    await collaboratorsApi.getStudyCollaboratorRoles(props.studyId)
      .then((response: AxiosResponse) =>
        {
          console.log(response.data)
          if(response.data) {
            collaboratorRoles.value = response.data
          } else {
            console.log("collaborator roles are empty")
          }
        }
      )
  } catch(e) {
    console.error('Cannot list collaborator roles: ' + props.studyId, e);
  }
}

function addStudyCollaborator(collaborator: UserInfo, studyRole: StudyRole) {
  collaboratorsApi.setStudyCollaboratorRoles(props.studyId, collaborator.uid, new Set([StudyRole.Operator, StudyRole.Viewer]))
    .then(listCollaborators);
}

async function searchUser(query: string) {
  await usersApi.findUsers(query)
    .then((response) => {
      console.log(response.data);
      console.log(typeof response.data.result.users[0])
      return response.data
    });
}

searchUser('a');

addStudyCollaborator({uid: '9ff82926-9e0b-4111-9ba2-a81f866c0e53', name: 'Daniil Barkov', institution: 'Redlink GmbH', email: 'daniil.barkov@redlink.at'}, StudyRole.Admin)

function getRoleChoices(roles: StudyRole[]) {
  let roleChoices = [];
  console.log(roles);
  roles.forEach((item, index) => {
      if (item === StudyRole.Admin) {
        roleChoices.push({label: 'Study Administrator', value: StudyRole.Admin})
      }
      if (item === StudyRole.Operator) {
        roleChoices.push({label: 'Study Operator', value: StudyRole.Operator})
      }
      if (item === StudyRole.Viewer) {
        roleChoices.push({label: 'Study Viewer', value: StudyRole.Viewer})
      }
  })

  console.log(roleString);
  return roleString;
}

function changeValue(collaborator:any) {
  console.log("changeValue");
  console.log(collaborator);
  const userInfo: Collaborator = {
    roles: collaborator.roles,
    user: {
      uid: collaborator.uid,
      name: collaborator.name,
      institution: collaborator.institution,
      email: collaborator.email,
    }
  }
  console.log(userInfo.roles);
  const i = collaboratorsList.value.findIndex(c => c.user.uid === collaborator.uid);
  console.log(i);

 if(i>-1) {
    //collaboratorsList.value[i].roles = roles;
    //collaboratorsApi.setStudyCollaboratorRoles(props.studyId, collaborator.uid, roles);
  }
}

function deleteStudyCollaborator(studyGroup: CollaboratorDetails) {
  //studyGroupsApi.deleteStudyGroup(studyGroup.studyId as number, studyGroup.studyGroupId as number).then(listCollaborators)
}

listCollaborators();
</script>

<template>
  <div class="collaborator-list">
    <MoreTable
      row-id="studyGroupId"
      :title="$t('studyCollaborators')"
      :columns="collaboratorColumns"
      :rows="collaboratorsList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      empty-message="No collaborators added yet"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

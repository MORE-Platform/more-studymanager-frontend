<script setup lang="ts">
import {Ref, ref} from 'vue'
import {useStudyGroupsApi} from '../composable/useApi'
import {useUsersApi} from "../composable/useApi";
import {useCollaboratorsApi} from "../composable/useApi";
import {useDialog} from 'primevue/usedialog';
import {
  MoreTableAction, MoreTableChoice, MoreTableActionOption,
  MoreTableColumn, MoreTableFieldType, MoreTableCollaboratorItem, MoreTableRowActionResult, MoreTableActionOptions,
} from '../models/MoreTableModel'
import {StudyGroup, Collaborator, CollaboratorDetails, Study, StudyRole, UserInfo} from '../generated-sources/openapi';
import MoreTable from './shared/MoreTable.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {AxiosResponse} from "axios";
import StudyCollaboratorDialog from './dialog/StudyCollaboratorDialog.vue'

const dialog = useDialog();

const props = defineProps({
  studyId: {
    type: Number,
    required: true
  },
});


const roleList = [
  {label: 'STUDY_ADMIN', value: StudyRole.Admin},
  {label: 'STUDY_OPERATOR', value: StudyRole.Operator},
  {label: 'STUDY_VIEWER', value: StudyRole.Viewer}
]

const { collaboratorsApi } = useCollaboratorsApi()
const { usersApi } = useUsersApi();
const { studyGroupsApi } = useStudyGroupsApi()
const route = useRoute()
const {t} = useI18n();
const studyGroupList: Ref<StudyGroup[]> = route.meta['studyGroups'] as Ref<StudyGroup[]>;

const collaboratorsList: Ref<MoreTableCollaboratorItem[]> = ref([]);
const collaboratorRoles: Ref<CollaboratorDetails[]> = ref([]);


const collaboratorColumns: MoreTableColumn[] = [
  {field: 'name', header: 'Name', sortable: true, filterable: {showFilterMatchModes: false}},
  {field: 'institution', header: 'Organisation', sortable: true, filterable: {showFilterMatchModes: false}},
  {field: 'email', header: 'E-Mail', sortable: true},
  { field: 'roles', header: 'Role(s)', type: MoreTableFieldType.multiselect,
    editable: {values: [
      {label: 'Study Administrator', value: StudyRole.Admin},
        {label: 'Study Operator', value: StudyRole.Operator},
        {label: 'Study Viewer', value: StudyRole.Viewer}]},
    sortable: true, filterable: {showFilterMatchModes: false}, placeholder: 'choose Role'}

]

const rowActions: MoreTableAction[] = [
  { id:'deleteCollab', label:'Delete', icon:'pi pi-trash', confirm: {header: 'Confirm', message: 'Really delete the collaborator?'}}
]

const searchQuery: Ref<string> = ref('');

const tableActions: MoreTableAction[] = [
  { id:'create', label:'Add Collaborator', icon: 'pi pi-plus', options: {type: 'search', placeholder: 'Search Collaborators',
      valuesCallback: (query: string) => {
        return usersApi.findUsers(query)
          .then((response) => {
            const resultList = response.data.result.users.map((u: any) => ({label: u.name, value: u.uid, institution: u.institution}))
            return resultList
          });
      }
  }}
]

function execute(action: any) {
  switch (action.id) {
    case 'deleteCollab': return deleteStudyCollaborator(action.row)
    case 'create': return openAddCollaboratorDialog(action)
    default: console.error('no handler for action', action)
  }
}

async function listCollaborators() {
  try {
     await collaboratorsApi.listStudyCollaborators(props.studyId)
      .then(
        (response: AxiosResponse) => {
          collaboratorsList.value = response.data.map((item: Collaborator) =>
            ({uid: item.user.uid, name: item.user.name, institution: item.user.institution, email: item.user.email, roles: getRoleChoices(item.roles)}))
          //return response.data
        });
  } catch(e) {
    console.error('Cannot list collaborators: ' + props.studyId, e);
  }
}

async function getStudyCollaboratorRoles() {
  try {
    await collaboratorsApi.getStudyCollaboratorRoles(props.studyId)
      .then((response: AxiosResponse) =>
        {
          if(response.data) {
            collaboratorRoles.value = response.data
          }
        }
      )
  } catch(e) {
    console.error('Cannot list collaborator roles: ' + props.studyId, e);
  }
}

async function searchUser(query: string) {
  return await usersApi.findUsers(query)
    .then((response) => {
      const resultList = response.data.result.users.map((u: any) => ({label: u.name, value: u.uid, institution: u.institution}))
      return resultList
    });
}

function addStudyCollaborator(collaborator: MoreTableCollaboratorItem) {
  collaboratorsApi.setStudyCollaboratorRoles(props.studyId, collaborator.uid, collaborator.roles.map((c: any) => c.value))
    .then(listCollaborators)
}

function getRoleChoices(roles: StudyRole[]) {
  let roleChoices: MoreTableChoice[] = [];
  roles.forEach((item) => {
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
  return roleChoices;
}

function changeValue(collabListItem:any) {
  const collaborator: Collaborator = {
    roles: collabListItem.roles.map((v: any) => v.value),
    user: {
      uid: collabListItem.uid,
      name: collabListItem.name,
      institution: collabListItem.institution,
      email: collabListItem.email,
    }
  }
  const i = collaboratorsList.value.findIndex(c => c.uid === collabListItem.uid);

  if(i>-1) {
    collaboratorsList.value[i].roles = collabListItem.roles;
    collaboratorsApi.setStudyCollaboratorRoles(props.studyId, collabListItem.uid, collaborator.roles)
  }
}

function deleteStudyCollaborator(collaborator: MoreTableCollaboratorItem) {
  console.log("deleteCollaborator")
  collaboratorsApi.clearStudyCollaboratorRoles(props.studyId, collaborator.uid)
    .then(listCollaborators)
}


function openAddCollaboratorDialog(action: any) {
  dialog.open(StudyCollaboratorDialog, {
    data: {
      collaborator: {
        name: action.properties.label,
        institution: action.properties.institution,
        uid: action.properties.value
      } as MoreTableCollaboratorItem,
      placeholder: 'Choose Collaborator',
      roleList
    },
    props: {
      header: 'Add Collaborator',
      style: {
        width: '50vw'
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      },
      modal: true
    },
    onClose: (options) => {
      if(options?.data) {
        addStudyCollaborator(options.data)
      }
    }
  })
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

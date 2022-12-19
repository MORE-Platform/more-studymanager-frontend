<script setup lang="ts">
  import { PropType, Ref, ref } from 'vue';
  import { useUsersApi } from '../composable/useApi';
  import { useCollaboratorsApi } from '../composable/useApi';
  import { useDialog } from 'primevue/usedialog';
  import {
    MoreTableAction,
    MoreTableChoice,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableCollaboratorItem,
    MoreTableActionResult,
    MoreTableRowActionResult,
  } from '../models/MoreTableModel';
  import {
    Collaborator,
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import MoreTable from './shared/MoreTable.vue';
  import ConfirmDialog from 'primevue/confirmdialog';
  //import {useI18n} from 'vue-i18n';
  import { AxiosResponse } from 'axios';
  import StudyCollaboratorDialog from './dialog/StudyCollaboratorDialog.vue';

  const dialog = useDialog();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    userRoles: {
      type: Array as PropType<Array<StudyRole>>,
      required: true,
    },
    useConfirmDialog: {
      type: Boolean,
      default: true,
    },
    studyStatus: {
      type: String as PropType<StudyStatus>,
      required: true,
    },
  });

  const roleList = [
    { label: 'Study Administrator', value: StudyRole.Admin },
    { label: 'Study Operator', value: StudyRole.Operator },
    { label: 'Study Viewer', value: StudyRole.Viewer },
  ];

  const { collaboratorsApi } = useCollaboratorsApi();
  const { usersApi } = useUsersApi();
  //const {t} = useI18n();

  const collaboratorsList: Ref<MoreTableCollaboratorItem[]> = ref([]);

  const editAccessRoles: StudyRole[] = [StudyRole.Admin];

  const editAccess = props.userRoles.some((r: StudyRole) =>
    editAccessRoles.includes(r)
  );

  const collaboratorColumns: MoreTableColumn[] = [
    {
      field: 'name',
      header: 'name',
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'institution',
      header: 'user.institution',
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    { field: 'email', header: 'email', sortable: true },
    {
      field: 'roles',
      header: 'roles',
      type: MoreTableFieldType.multiselect,
      editable: {
        values: [
          { label: 'Study Administrator', value: StudyRole.Admin },
          { label: 'Study Operator', value: StudyRole.Operator },
          { label: 'Study Viewer', value: StudyRole.Viewer },
        ],
      },
      sortable: true,
      filterable: { showFilterMatchModes: false },
      placeholder: 'choose Role',
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'deleteCollab',
      label: 'Delete',
      icon: 'pi pi-trash',
      visible: () => editAccess,
      confirm: {
        header: 'Confirm',
        message: 'Really delete the collaborator?',
      },
    },
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      label: 'Add Collaborator',
      icon: 'pi pi-plus',
      visible: () => editAccess,
      options: {
        type: 'search',
        values: [],
        valuesCallback: {
          placeholder: 'placeholder.addCollaborator',
          filterPlaceholder: 'placeholder.searchCollaborators',
          noResultsPlaceholder: 'placeholder.noResultsFound',
          callback: (query: string) => {
            return usersApi.findUsers(query).then((response: AxiosResponse) => {
              const resultList = response.data.result.users.map(
                (u: MoreTableCollaboratorItem) => ({
                  label: u.name,
                  value: u.uid,
                  institution: u.institution,
                })
              );
              return resultList;
            });
          },
        },
      },
    },
  ];

  function execute(
    action: MoreTableRowActionResult<MoreTableCollaboratorItem>
  ) {
    switch (action.id) {
      case 'deleteCollab':
        return deleteStudyCollaborator(action.row);
      case 'create':
        return openAddCollaboratorDialog(action);
      default:
        console.error('no handler for action', action);
    }
  }

  async function listCollaborators() {
    try {
      await collaboratorsApi
        .listStudyCollaborators(props.studyId)
        .then((response: AxiosResponse) => {
          collaboratorsList.value = response.data.map((item: Collaborator) => ({
            uid: item.user.uid,
            name: item.user.name,
            institution: item.user.institution,
            email: item.user.email,
            roles: getRoleChoices(item.roles),
          }));
          //return response.data
        });
    } catch (e) {
      console.error('Cannot list collaborators: ' + props.studyId, e);
    }
  }

  function addStudyCollaborator(collaborator: MoreTableCollaboratorItem) {
    collaboratorsApi
      .setStudyCollaboratorRoles(
        props.studyId,
        collaborator.uid,
        collaborator.roles.map((c: MoreTableChoice) => c.value as StudyRole)
      )
      .then(listCollaborators);
  }

  function getRoleChoices(roles: StudyRole[]) {
    const roleChoices: MoreTableChoice[] = [];
    roles.forEach((item) => {
      if (item === StudyRole.Admin) {
        roleChoices.push({
          label: 'Study Administrator',
          value: StudyRole.Admin,
        });
      }
      if (item === StudyRole.Operator) {
        roleChoices.push({
          label: 'Study Operator',
          value: StudyRole.Operator,
        });
      }
      if (item === StudyRole.Viewer) {
        roleChoices.push({ label: 'Study Viewer', value: StudyRole.Viewer });
      }
    });
    return roleChoices;
  }

  function changeValue(collabListItem: MoreTableCollaboratorItem) {
    const collaborator: Collaborator = {
      roles: collabListItem.roles.map(
        (v: MoreTableChoice) => v.value as StudyRole
      ),
      user: {
        uid: collabListItem.uid,
        name: collabListItem.name,
        institution: collabListItem.institution,
        email: collabListItem.email,
      },
    };
    const i = collaboratorsList.value.findIndex(
      (c) => c.uid === collabListItem.uid
    );

    if (i > -1) {
      collaboratorsList.value[i].roles = collabListItem.roles;
      collaboratorsApi.setStudyCollaboratorRoles(
        props.studyId,
        collabListItem.uid,
        collaborator.roles
      );
    }
  }

  function deleteStudyCollaborator(collaborator: MoreTableCollaboratorItem) {
    collaboratorsApi
      .clearStudyCollaboratorRoles(props.studyId, collaborator.uid)
      .then(listCollaborators);
  }

  function openAddCollaboratorDialog(action: MoreTableActionResult) {
    dialog.open(StudyCollaboratorDialog, {
      data: {
        collaborator: {
          name: action.properties.label,
          institution: action.properties.institution,
          uid: action.properties.value,
        } as MoreTableCollaboratorItem,
        placeholder: 'placeholder.chooseRole',
        roleList,
      },
      props: {
        header: 'Add Collaborator',
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
      },
      onClose: (options) => {
        if (options?.data) {
          addStudyCollaborator(options.data);
        }
      },
    });
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
      :editable-access="editAccess"
      :edit-access-roles="editAccessRoles"
      :user-study-roles="props.userRoles"
      empty-message="No collaborators added yet"
      @onaction="execute($event)"
      @onchange="changeValue($event)"
    />
    <div v-if="useConfirmDialog">
      <ConfirmDialog></ConfirmDialog>
    </div>
  </div>
</template>

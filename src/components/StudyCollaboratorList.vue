/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
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
  import { AxiosError, AxiosResponse } from 'axios';
  import StudyCollaboratorDialog from './dialog/StudyCollaboratorDialog.vue';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import { useUserStore } from '../stores/userStore';

  const dialog = useDialog();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();
  const userStore = useUserStore();
  const { collaboratorsApi } = useCollaboratorsApi();
  const { usersApi } = useUsersApi();

  userStore.getUser();

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
    { label: t('study.roles.admin'), value: StudyRole.Admin },
    { label: t('study.roles.operator'), value: StudyRole.Operator },
    { label: t('study.roles.viewer'), value: StudyRole.Viewer },
  ];

  const collaboratorsList: Ref<MoreTableCollaboratorItem[]> = ref([]);

  const editAccessRoles: StudyRole[] = [StudyRole.Admin];

  const editAccess: boolean = props.userRoles.some(
    (r: StudyRole) =>
      editAccessRoles.includes(r) && props.studyStatus !== StudyStatus.Closed,
  );

  const collaboratorColumns: MoreTableColumn[] = [
    {
      field: 'name',
      header: t('studyCollaborator.collaboratorList.props.name'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'institution',
      header: t('studyCollaborator.collaboratorList.props.institution'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'email',
      header: t('studyCollaborator.collaboratorList.props.email'),
      sortable: true,
    },
    {
      field: 'roles',
      header: t('study.props.roles'),
      type: MoreTableFieldType.singleselect,
      editable: {
        values: [
          { label: t('study.roles.admin'), value: StudyRole.Admin },
          { label: t('study.roles.operator'), value: StudyRole.Operator },
          { label: t('study.roles.viewer'), value: StudyRole.Viewer },
        ],
      },
      sortable: true,
      filterable: { showFilterMatchModes: false },
      placeholder: t('global.placeholder.chooseRole'),
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      visible: (data: MoreTableCollaboratorItem) => {
        return data.uid !== userStore.user?.uid && editAccess;
      },
      confirmDeleteDialog: {
        header: t('studyCollaborator.dialog.header.delete'),
        message: t('studyCollaborator.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('studyCollaborator.dialog.deleteMsg.intro'),
              warningMsg: t('studyCollaborator.dialog.deleteMsg.warning'),
              confirmMsg: t('studyCollaborator.dialog.deleteMsg.confirm'),
              row: row,
              elTitle: row.institution
                ? row.name + ' (' + row.institution + ')'
                : row.name,
              elInfoTitle: t('studyCollaborator.dialog.assignedRoles'),
              elInfoDesc: getRolesString(row.roles),
            },
            props: {
              header: t('studyCollaborator.dialog.header.delete'),
              style: {
                width: '50vw',
              },
              breakpoints: {
                '960px': '75vw',
                '640px': '90vw',
              },
              modal: true,
              draggable: false,
            },
            onClose: (options) => {
              if (options?.data) {
                execute({
                  id: 'delete',
                  row: options.data as MoreTableCollaboratorItem,
                });
              }
            },
          }),
      },
    },
  ];

  function getRolesString(roles: Array<MoreTableChoice>): string {
    let rolesString = '';
    roles.forEach((item, index) => {
      rolesString += item.label;

      if (index < roles.length - 1) {
        rolesString += ', ';
      }
    });

    return rolesString;
  }

  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      label: t('studyCollaborator.collaboratorList.action.add'),
      icon: 'pi pi-angle-down',
      visible: () => editAccess,
      options: {
        type: 'search',
        values: [],
        valuesCallback: {
          placeholder: t('studyCollaborator.placeholder.addCollaborator'),
          filterPlaceholder: t(
            'studyCollaborator.placeholder.searchCollaborators',
          ),
          noResultsPlaceholder: t(
            'studyCollaborator.placeholder.noResultsFound',
          ),
          callback: (query: string) => {
            return usersApi.findUsers(query).then((response: AxiosResponse) => {
              return response.data.result.users.map(
                (u: MoreTableCollaboratorItem) => ({
                  label: u.name,
                  value: u.uid,
                  institution: u.institution,
                }),
              );
            });
          },
        },
      },
    },
  ];

  function execute(
    action: MoreTableRowActionResult<MoreTableCollaboratorItem>,
  ) {
    switch (action.id) {
      case 'delete':
        return deleteStudyCollaborator(action.row);
      case 'create':
        return openAddCollaboratorDialog(action);
      default:
        console.error('no handler for action', action);
    }
  }

  async function listCollaborators() {
    await collaboratorsApi
      .listStudyCollaborators(props.studyId)
      .then((response: AxiosResponse) => {
        collaboratorsList.value = response.data.map((c: Collaborator) => ({
          uid: c.user.uid,
          name: c.user.name,
          institution: c.user.institution,
          email: c.user.email,
          roles: getRoleChoices(c.roles),
        }));
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, `Cannot list collaborators: ${props.studyId}`),
      );
  }

  function addStudyCollaborator(collaborator: MoreTableCollaboratorItem) {
    collaboratorsApi
      .setStudyCollaboratorRoles(
        props.studyId,
        collaborator.uid,
        collaborator.roles.map((c: MoreTableChoice) => c.value as StudyRole),
      )
      .then(listCollaborators);
  }

  function getRoleChoices(roles: StudyRole[]) {
    const roleChoices: MoreTableChoice[] = [];
    roles.forEach((item) => {
      if (item === StudyRole.Admin) {
        roleChoices.push({
          label: t('study.roles.admin'),
          value: StudyRole.Admin,
        });
      }
      if (item === StudyRole.Operator) {
        roleChoices.push({
          label: t('study.roles.operator'),
          value: StudyRole.Operator,
        });
      }
      if (item === StudyRole.Viewer) {
        roleChoices.push({
          label: t('study.roles.viewer'),
          value: StudyRole.Viewer,
        });
      }
    });
    return roleChoices;
  }

  function changeValue(collabListItem: MoreTableCollaboratorItem) {
    const collaborator: Collaborator = {
      roles: collabListItem.roles.map(
        (c: MoreTableChoice) => c.value as StudyRole,
      ),
      user: {
        uid: collabListItem.uid,
        name: collabListItem.name,
        institution: collabListItem.institution,
        email: collabListItem.email,
      },
    };
    const i = collaboratorsList.value.findIndex(
      (c) => c.uid === collabListItem.uid,
    );

    if (i > -1) {
      collaboratorsList.value[i].roles = collabListItem.roles;
      collaboratorsApi.setStudyCollaboratorRoles(
        props.studyId,
        collabListItem.uid,
        collaborator.roles,
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
        placeholder: t('global.placeholder.chooseRole'),
        roleList,
      },
      props: {
        header: t('studyCollaborator.dialog.header.add'),
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
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
  <div class="collaborator-list mt-20">
    <MoreTable
      row-id="studyGroupId"
      :title="$t('studyCollaborator.collaboratorList.title')"
      :subtitle="$t('studyCollaborator.collaboratorList.description')"
      :columns="collaboratorColumns"
      :rows="collaboratorsList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :editable-access="editAccess"
      :editable="
        (data: MoreTableCollaboratorItem) => {
          return data.uid !== userStore.user?.uid && editAccess;
        }
      "
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

<style scoped lang="postcss">
  :deep(.action .dropdown-search .p-dropdown-trigger) {
    display: none;
  }
</style>

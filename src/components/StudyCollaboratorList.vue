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
    MoreTableRowActionResult,
    MoreTableCollaboratorItemOption,
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
  import Dropdown from 'primevue/dropdown';

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

  const roleList: MoreTableChoice[] = [
    { label: t('study.roles.admin'), value: StudyRole.Admin },
    { label: t('study.roles.operator'), value: StudyRole.Operator },
    { label: t('study.roles.viewer'), value: StudyRole.Viewer },
  ];

  const collaboratorsList: Ref<MoreTableCollaboratorItem[]> = ref([]);

  const editableRoles: StudyRole[] = [StudyRole.Admin];

  const editAccess: boolean = props.userRoles.some(
    (r: StudyRole) =>
      editableRoles.includes(r) && props.studyStatus !== StudyStatus.Closed,
  );

  const collaboratorColumns: MoreTableColumn[] = [
    {
      field: 'name',
      header: t('studyCollaborator.collaboratorList.props.name'),
      sortable: true,
      filterable: true,
    },
    {
      field: 'institution',
      header: t('studyCollaborator.collaboratorList.props.institution'),
      sortable: true,
      filterable: true,
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
        enabled: true,
        values: roleList,
      },
      sortable: true,
      filterable: true,
      placeholder: t('global.placeholder.chooseRole'),
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteCollaborator'),
      visible: (data: MoreTableCollaboratorItem): boolean => {
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
                ? `${row.name} (${row.institution})`
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
                executeAction({
                  id: 'delete',
                  row: options.data,
                } as MoreTableRowActionResult);
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

  function executeAction(action: MoreTableRowActionResult): void {
    switch (action.id) {
      case 'delete':
        deleteStudyCollaborator(action.row as MoreTableCollaboratorItem);
        break;
      default:
        console.error('no handler for action', action);
    }
  }

  async function listCollaborators(): Promise<void> {
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

  function addStudyCollaborator(collaborator: MoreTableCollaboratorItem): void {
    collaboratorsApi
      .setStudyCollaboratorRoles(
        props.studyId,
        collaborator.uid,
        collaborator.roles.map((c: MoreTableChoice) => c.value as StudyRole),
      )
      .then(listCollaborators);
  }

  function getRoleChoices(roles: StudyRole[]): MoreTableChoice[] {
    const roleChoices: MoreTableChoice[] = [];
    roles.forEach((item) => {
      if (item === StudyRole.Admin) {
        roleChoices.push({
          label: t('study.roles.admin'),
          value: StudyRole.Admin,
        } as MoreTableChoice);
      }
      if (item === StudyRole.Operator) {
        roleChoices.push({
          label: t('study.roles.operator'),
          value: StudyRole.Operator,
        } as MoreTableChoice);
      }
      if (item === StudyRole.Viewer) {
        roleChoices.push({
          label: t('study.roles.viewer'),
          value: StudyRole.Viewer,
        } as MoreTableChoice);
      }
    });
    return roleChoices;
  }

  function changeValue(collabListItem: MoreTableCollaboratorItem): void {
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

  function deleteStudyCollaborator(
    collaborator: MoreTableCollaboratorItem,
  ): void {
    collaboratorsApi
      .clearStudyCollaboratorRoles(props.studyId, collaborator.uid)
      .then(listCollaborators);
  }

  function openAddCollaboratorDialog(
    options: MoreTableCollaboratorItemOption,
  ): void {
    dialog.open(StudyCollaboratorDialog, {
      data: {
        collaborator: {
          name: options.label,
          institution: options.institution,
          uid: options.value,
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

  const collaboratorList: Ref<MoreTableCollaboratorItemOption[]> = ref([]);
  async function filterActionHandler(query: string): Promise<void> {
    if (query) {
      collaboratorList.value = await getUsers(query);
    }
  }

  async function getUsers(
    query: string,
  ): Promise<MoreTableCollaboratorItemOption[]> {
    return usersApi.findUsers(query).then((response: AxiosResponse) => {
      return response.data.result.users.map(
        (u: MoreTableCollaboratorItem) =>
          ({
            label: u.name,
            value: u.uid,
            institution: u.institution,
          }) as MoreTableCollaboratorItemOption,
      );
    });
  }

  listCollaborators();
</script>

<template>
  <div class="collaborator-list mt-20">
    <MoreTable
      row-id="uid"
      :title="$t('studyCollaborator.collaboratorList.title')"
      :subtitle="$t('studyCollaborator.collaboratorList.description')"
      :columns="collaboratorColumns"
      :rows="collaboratorsList"
      :row-actions="rowActions"
      :editable-access="editAccess"
      :editable="
        (data: MoreTableCollaboratorItem) => {
          return data.uid !== userStore.user?.uid && editAccess;
        }
      "
      :edit-access-roles="editableRoles"
      :empty-message="$t('studyCollaborator.placeholder.defaultEmptyMsg')"
      @on-action="executeAction($event)"
      @on-change="changeValue($event)"
    >
      <template #tableActions>
        <div>
          <Dropdown
            class="button p-button dropdown-search !p-0"
            :filter="true"
            :options="collaboratorList"
            option-label="label"
            option-value="value"
            :disabled="!editAccess"
            panel-class="dropdown-search-panel"
            :empty-message="
              t('studyCollaborator.placeholder.searchCollaborators')
            "
            :empty-filter-message="
              t('studyCollaborator.placeholder.noResultsFound')
            "
            @filter="filterActionHandler($event.value)"
          >
            <template #value>
              <span class="pi pi-search ml-1 mr-2 text-white"></span>
              <span class="text-white">
                {{ t('studyCollaborator.placeholder.addCollaborator') }}
              </span>
            </template>
            <template #dropdownicon>
              <span class="pi pi-angle-down text-white"></span>
            </template>
            <template #option="slotProps">
              <div
                v-for="(item, index) in slotProps"
                :key="index"
                @click="openAddCollaboratorDialog(slotProps.option)"
              >
                <span class="color-primary font-medium">
                  {{ item.label }}
                </span>
                <span v-if="item.institution" class="block">
                  ({{ item.institution }})
                </span>
              </div>
            </template>
          </Dropdown>
        </div>
      </template>
    </MoreTable>

    <div v-if="useConfirmDialog">
      <ConfirmDialog></ConfirmDialog>
    </div>
  </div>
</template>

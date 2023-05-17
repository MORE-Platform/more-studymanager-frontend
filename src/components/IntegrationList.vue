<script setup lang="ts">
  import { useComponentsApi, useObservationsApi } from '../composable/useApi';
  import {
    ComponentFactory,
    Observation,
    Participant,
    StudyRole,
  } from '../generated-sources/openapi';
  import { ref, Ref } from 'vue';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { useDialog } from 'primevue/usedialog';
  import {
    MoreIntegrationTableMap,
    MoreTableAction,
    MoreTableFieldType,
  } from '../models/MoreTableModel';
  import { useI18n } from 'vue-i18n';
  import DynamicDialog from 'primevue/dynamicdialog';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import MoreTable from './shared/MoreTable.vue';
  import useLoader from '../composable/useLoader';

  const { observationsApi } = useObservationsApi();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();
  const { t } = useI18n();
  const dialog = useDialog();
  const loader = useLoader();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    actionsVisible: {
      type: Boolean,
      default: false,
    },
  });

  const observationList: Ref<Observation[]> = ref([]);
  const integrationList: Ref<MoreIntegrationTableMap[]> = ref([]);

  const integrationListColumns = [
    {
      field: 'tokenId',
      header: t('integration.props.tokenId'),
      sortable: true,
    },
    {
      field: 'tokenLabel',
      header: t('integration.props.tokenLabel'),
      sortable: true,
    },
    {
      field: 'token',
      header: t('integration.props.token'),
      sortable: true,
    },
    {
      field: 'observationId',
      header: t('integration.props.observationId'),
      sortable: true,
    },
    {
      field: 'observationTitle',
      header: t('integration.props.observationTitle'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
    },
    {
      field: 'created',
      header: t('integration.props.created'),
      sortable: true,
      type: MoreTableFieldType.datetime,
    },
  ];
  const dummyIntegrationList = [
    {
      observationId: '1',
      observationTitle: 'dummy title 1',
      tokenId: '1',
      tokenLabel: 'dummy token title',
      token: '490349',
      created: 'Sat Sep 13 2023 00:00:00 GMT+0000 (Coordinated Universal Time)',
    },
    {
      observationId: '2',
      observationTitle: 'here',
      tokenId: '1',
      tokenLabel: 'dummy token title',
      token: '490349',
      created:
        'Sat July 01 2022 00:00:00 GMT+0000 (Coordinated Universal Time)',
    },
  ];

  async function getObservationList(): Promise<void> {
    await observationsApi
      .listObservations(props.studyId)
      .then((response: AxiosResponse) => {
        observationList.value = response.data;
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot list observations')
      );
  }
  async function listIntegrations(): Promise<void> {
    integrationList.value = (await observationsApi
      .listObservations(props.studyId)
      .then(async (observationRes) => {
        observationRes.data.map(async (observation: Observation) => {
          await observationsApi
            .getTokens(props.studyId, observation.observationId as number)
            .then((tokenRes) => {
              tokenRes.data.forEach((token) => {
                return {
                  observationId: observation.observationId,
                  observationTitle: observation.title,
                  tokenId: token.tokenId,
                  tokenLabel: token.tokenLabel,
                  token: token.token,
                  created: token.created,
                };
              });
            });
        });
      })) as MoreIntegrationTableMap[];
  }

  async function getFactories() {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }
  const factories: ComponentFactory[] = await getFactories();
  console.log(factories);

  /*
  async function getObservationToken(
    observationId: number
  ): Promise<EndpointToken[]> {
    await observationsApi
      .getTokens(props.studyId, observationId)
      .then((response) => {
        return response.data;
      });
    return [];
  }
   */

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      visible: () => props.actionsVisible,
      confirmDeleteDialog: {
        header: t('integration.dialog.header.delete'),
        message: t('integration.dialog.msg.delete'),
        dialog: (row: any) =>
          dialog.open(DeleteMoreTableRowDialog, {
            data: {
              introMsg: t('integration.dialog.deleteMsg.intro'),
              warningMsg: t('integration.dialog.deleteMsg.warning'),
              confirmMsg: t('integration.dialog.deleteMsg.confirm'),
              participant: row as Participant,
            },
            props: {
              header: t('integration.dialog.header.delete'),
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
                execute({
                  id: 'delete',
                  row: options.data as MoreIntegrationTableMap,
                });
              }
            },
          }),
      },
    },
  ];

  const tableActions: MoreTableAction[] = [
    {
      id: 'create',
      icon: 'pi pi-plus',
      label: t('integration.integrationList.action.add'),
      visible: () => props.actionsVisible,
    },
  ];

  function execute(action: any) {
    switch (action.id) {
      case 'delete':
        return deleteIntegration(action.row);
      case 'crate':
        return createIntegration(action.row);
    }
  }

  async function deleteIntegration(integration: MoreIntegrationTableMap) {
    await observationsApi
      .deleteToken(
        props.studyId,
        integration.observationId,
        integration.tokenId
      )
      .then(listIntegrations)
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          'Cannot delete integration: TokenId (' +
            integration.tokenId +
            '), Observation Id: (' +
            integration.observationId +
            ')'
        );
      });
  }

  async function createIntegration(integration: MoreIntegrationTableMap) {
    await observationsApi
      .createToken(
        props.studyId,
        integration.observationId,
        integration.tokenLabel
      )
      .then(listIntegrations)
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          'Cannot create integration for ObservationId ' +
            integration.observationId
        );
      });
  }

  getObservationList();
  listIntegrations();
</script>

<template>
  <div class="integration-list">
    <MoreTable
      row-id="tokenId"
      :sort-options="{ sortField: 'tokenLabel', sortOrder: 1 }"
      :title="$t('integration.integrationList.title')"
      :subtitle="$t('integration.integrationList.description')"
      :columns="integrationListColumns"
      :rows="dummyIntegrationList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :loading="loader.isLoading.value"
      :editable-access="false"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('integration.integrationList.emptyListMsg')"
      @onaction="execute($event)"
    />
    <DynamicDialog />
  </div>
</template>

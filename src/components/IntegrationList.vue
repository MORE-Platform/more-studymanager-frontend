/* * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more *
contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute * for
Digital Health and Prevention -- A research institute of the * Ludwig Boltzmann
Gesellschaft, Oesterreichische Vereinigung zur * Foerderung der
wissenschaftlichen Forschung). * Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { useComponentsApi, useObservationsApi } from '../composable/useApi';
  import {
    ComponentFactory,
    EndpointToken,
    Observation,
    StudyRole,
  } from '../generated-sources/openapi';
  import { ref, Ref } from 'vue';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { useDialog } from 'primevue/usedialog';
  import {
    MoreIntegrationLink,
    MoreIntegrationTableMap,
    MoreTableAction,
    MoreTableFieldType,
  } from '../models/MoreTableModel';
  import { useI18n } from 'vue-i18n';
  import DynamicDialog from 'primevue/dynamicdialog';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import MoreTable from './shared/MoreTable.vue';
  import useLoader from '../composable/useLoader';
  import IntegrationDialog from './dialog/IntegrationDialog.vue';
  import CopyTokenDialog from './dialog/CopyTokenDialog.vue';

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
      field: 'observationId',
      header: t('integration.props.observationId'),
      sortable: true,
      filterable: { showFilterMatchModes: false },
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
    integrationList.value = [];
    await observationsApi
      .listObservations(props.studyId)
      .then(async (observationRes) => {
        return await Promise.all(
          observationRes.data.map(async (observation: Observation) => {
            return await observationsApi
              .getTokens(props.studyId, observation.observationId as number)
              .then((tokenRes) => {
                if (tokenRes.data.length) {
                  tokenRes.data.forEach((token) => {
                    integrationList.value.push({
                      observationId: observation.observationId as number,
                      observationTitle: observation.title as string,
                      tokenId: token.tokenId,
                      tokenLabel: token.tokenLabel,
                      created: token.created,
                    });
                  });
                }
              })
              .catch((e: AxiosError) => {
                handleIndividualError(
                  e,
                  'Could not get the integration tokens for: ' +
                    observation.observationId
                );
              });
          })
        );
      })
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          'Could not get observation list: ' + props.studyId
        );
      });
  }

  async function getFactories() {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }
  const factories: ComponentFactory[] = await getFactories();

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
              row: row,
              elTitle:
                row.tokenLabel + ' (Observation: ' + row.observationTitle + ')',
              elInfoDesc: row.token,
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
              draggable: false,
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
      case 'create':
        return openIntegrationDialog(t('integration.dialog.header.create'));
    }
  }

  async function openIntegrationDialog(headerText: string) {
    dialog.open(IntegrationDialog, {
      data: {
        observationList: observationList,
        factories: factories,
      },
      props: {
        header: headerText,
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
        closeOnEscape: false,
      },
      onClose: (options) => {
        if (options?.data) {
          createIntegration(options.data);
        }
      },
    });
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function getObservationTokens(studyId: number, observationId: number) {
    await observationsApi.getTokens(studyId, observationId).then((request) => {
      return request;
    });
  }
  getObservationTokens(props.studyId, 1);

  async function createIntegration(integrationCreate: MoreIntegrationLink) {
    await observationsApi
      .createToken(
        props.studyId,
        integrationCreate.observationId,
        integrationCreate.tokenLabel
      )
      .then((response) => {
        openInfoDialog(response.data);
        listIntegrations();
      })
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          'Cannot create integration for ObservationId ' +
            integrationCreate.observationId +
            '(' +
            integrationCreate.tokenLabel +
            ')'
        );
      });
  }

  function openInfoDialog(token: EndpointToken) {
    dialog.open(CopyTokenDialog, {
      data: {
        title: token.tokenLabel + ' (Id: ' + token.tokenId + ')',
        message: t('integration.dialog.msg.createdToken'),
        highlightMsg: token.token,
      },
      props: {
        header: t('integration.dialog.header.tokenCopy'),
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
      :rows="integrationList"
      :row-actions="rowActions"
      :table-actions="tableActions"
      :loading="loader.isLoading.value"
      :editable-access="false"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="$t('integration.integrationList.emptyListMsg')"
      class="table-title-width table-btn-min-height"
      @onaction="execute($event)"
    />
    <DynamicDialog />
  </div>
</template>

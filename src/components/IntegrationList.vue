/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { useComponentsApi, useObservationsApi } from '../composable/useApi';
  import {
    ComponentFactory,
    EndpointToken,
    Observation,
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import { PropType, ref, Ref } from 'vue';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { useDialog } from 'primevue/usedialog';
  import {
    MoreIntegrationLink,
    MoreIntegrationTableMap,
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
  } from '../models/MoreTableModel';
  import { useI18n } from 'vue-i18n';
  import DynamicDialog from 'primevue/dynamicdialog';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import MoreTable from './shared/MoreTable.vue';
  import useLoader from '../composable/useLoader';
  import IntegrationDialog from './dialog/IntegrationDialog.vue';
  import CopyTokenDialog from './dialog/CopyTokenDialog.vue';
  import Button from 'primevue/button';

  const { observationsApi } = useObservationsApi();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();
  const { t } = useI18n();
  const dialog = useDialog();
  const loader = useLoader();

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyStatus: { type: String as PropType<StudyStatus>, required: true },
  });

  const sortOptions: MoreTableSortOptions = {
    sortField: 'tokenLabel',
    sortOrder: 1,
  };

  const actionsVisible = props.studyStatus !== StudyStatus.Closed;

  let observationList: Observation[] = [];
  const integrationList: Ref<MoreIntegrationTableMap[]> = ref([]);

  const integrationColumns: MoreTableColumn[] = [
    {
      field: 'tokenId',
      header: t('integration.props.tokenId'),
      sortable: true,
    },
    {
      field: 'tokenLabel',
      header: t('integration.props.tokenLabel'),
      sortable: true,
      editable: true,
    },
    {
      field: 'observationId',
      header: t('integration.props.observationId'),
      sortable: true,
      filterable: true,
    },
    {
      field: 'observationTitle',
      header: t('integration.props.observationTitle'),
      sortable: true,
      filterable: true,
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
        observationList = response.data;
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot list observations'),
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
                    } as MoreIntegrationTableMap);
                  });
                }
              })
              .catch((e: AxiosError) => {
                handleIndividualError(
                  e,
                  `Could not get the integration tokens for: ${observation.observationId}`,
                );
              });
          }),
        );
      })
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          `Could not get observation list: ${props.studyId}`,
        );
      });
  }

  async function getFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }
  const factories: ComponentFactory[] = await getFactories();

  const rowActions: MoreTableAction[] = [
    {
      id: 'clone',
      label: t('global.labels.clone'),
      tooltip: t('tooltips.moreTable.cloneIntegration'),
      visible: () => actionsVisible,
    },
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.moreTable.deleteObservation'),
      visible: () => actionsVisible,
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
              elTitle: `${row.tokenLabel} (Observation: ${row.observationTitle})`,
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

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row as MoreIntegrationTableMap;
    switch (action.id) {
      case 'delete':
        deleteIntegration(row);
        break;
      case 'clone':
        createIntegration({
          observationId: row.observationId,
          tokenLabel: row.tokenLabel,
        } as MoreIntegrationLink);
        break;
    }
  }

  async function updateIntegration(
    integration: MoreIntegrationTableMap,
  ): Promise<void> {
    await observationsApi
      .updateTokenLabel(
        props.studyId,
        integration.observationId,
        integration.tokenId,
        {
          tokenId: integration.tokenId,
          tokenLabel: integration.tokenLabel,
          created: integration.created,
          token: '',
        } as EndpointToken,
      )
      .then(listIntegrations)
      .catch((e: AxiosError) =>
        handleIndividualError(
          e,
          `Couldn't update integration ${integration.observationTitle}`,
        ),
      );
  }

  async function openIntegrationDialog(headerText: string): Promise<void> {
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

  async function deleteIntegration(
    integration: MoreIntegrationTableMap,
  ): Promise<void> {
    await observationsApi
      .deleteToken(
        props.studyId,
        integration.observationId,
        integration.tokenId,
      )
      .then(listIntegrations)
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          `Cannot delete integration: TokenId (${integration.tokenId}), Observation Id: (${integration.observationId})`,
        );
      });
  }

  async function createIntegration(
    integrationCreate: MoreIntegrationLink,
  ): Promise<void> {
    await observationsApi
      .createToken(props.studyId, integrationCreate.observationId, {
        tokenId: 0,
        tokenLabel: integrationCreate.tokenLabel,
        created: '',
        token: '',
      } as EndpointToken)
      .then((response) => {
        openInfoDialog(response.data);
        listIntegrations();
      })
      .catch((e: AxiosError) => {
        handleIndividualError(
          e,
          `Cannot create integration for ObservationId ${integrationCreate.observationId} (${integrationCreate.tokenLabel})`,
        );
      });
  }

  function openInfoDialog(token: EndpointToken): void {
    dialog.open(CopyTokenDialog, {
      data: {
        title: `${token.tokenLabel} (Id: ${token.tokenId})`,
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
        closeOnEscape: false,
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
      :sort-options="sortOptions"
      :title="$t('integration.integrationList.title')"
      :subtitle="$t('integration.integrationList.description')"
      :columns="integrationColumns"
      :rows="integrationList"
      :row-actions="rowActions"
      :loading="loader.isLoading.value"
      :editable-access="actionsVisible"
      :editable-user-roles="[StudyRole.StudyAdmin, StudyRole.StudyOperator]"
      :empty-message="$t('integration.integrationList.emptyListMsg')"
      class="table-title-width table-btn-min-height"
      @on-action="executeAction($event)"
      @on-change="updateIntegration($event)"
    >
      <template #tableActions="{ isInEditMode }">
        <div>
          <Button
            type="button"
            icon="pi pi-plus"
            :label="t('integration.integrationList.action.add')"
            :disabled="isInEditMode ? true : !actionsVisible"
            @click="
              openIntegrationDialog(t('integration.dialog.header.create'))
            "
          />
        </div>
      </template>
    </MoreTable>
    <DynamicDialog />
  </div>
</template>

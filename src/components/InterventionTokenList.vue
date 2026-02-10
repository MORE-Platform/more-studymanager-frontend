/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { useInterventionsApi } from '../composable/useApi';
  import {
    Intervention,
    StudyRole,
    StudyStatus,
  } from '@gs';
  import { PropType, ref, Ref } from 'vue';
  import axios from 'axios';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
  } from '../models/MoreTableModel';
  import { useI18n } from 'vue-i18n';
  import { useDialog } from 'primevue/usedialog';
  import MoreTable from './shared/MoreTable.vue';
  import DynamicDialog from 'primevue/dynamicdialog';
  import useLoader from '../composable/useLoader';
  import Button from 'primevue/button';
  import InterventionTokenDialog from './dialog/InterventionTokenDialog.vue';
  import CopyTriggerTokenDialog from './dialog/CopyTriggerTokenDialog.vue';

  interface InterventionTokenTableMap {
    interventionId: number;
    interventionTitle: string;
    tokenId: number;
    tokenLabel: string;
    created: string;
  }

  const { interventionsApi } = useInterventionsApi();
  const { handleIndividualError } = useErrorHandling();
  const { t } = useI18n();
  const loader = useLoader();
  const dialog = useDialog();

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyStatus: { type: String as PropType<StudyStatus>, required: true },
  });

  const sortOptions: MoreTableSortOptions = {
    sortField: 'tokenLabel',
    sortOrder: 1,
  };

  const actionsVisible = props.studyStatus !== StudyStatus.Closed;

  const tokenList: Ref<InterventionTokenTableMap[]> = ref([]);
  const apiTriggerInterventions: Ref<Intervention[]> = ref([]);

  const tokenColumns: MoreTableColumn[] = [
    {
      field: 'tokenId',
      header: t('interventionToken.props.tokenId'),
      sortable: true,
    },
    {
      field: 'tokenLabel',
      header: t('interventionToken.props.tokenLabel'),
      sortable: true,
    },
    {
      field: 'interventionTitle',
      header: t('interventionToken.props.interventionTitle'),
      sortable: true,
      filterable: true,
    },
    {
      field: 'created',
      header: t('interventionToken.props.created'),
      sortable: true,
      type: MoreTableFieldType.datetime,
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      tooltip: t('tooltips.deleteBtn'),
      visible: () => actionsVisible,
    },
  ];

  function executeAction(action: MoreTableRowActionResult): void {
    const row = action.row as InterventionTokenTableMap;
    switch (action.id) {
      case 'delete':
        if (window.confirm(
          `${t('interventionToken.dialog.deleteMsg.intro')}\n\n${row.tokenLabel} (Intervention: ${row.interventionTitle})\n\n${t('interventionToken.dialog.deleteMsg.warning')}`
        )) {
          deleteToken(row);
        }
        break;
    }
  }

  async function loadApiTriggerInterventions(): Promise<void> {
    try {
      const response = await interventionsApi.listInterventions(props.studyId);
      const interventions = response.data;

      const withTriggers = await Promise.all(
        interventions.map(async (intervention: Intervention) => {
          if (!intervention.interventionId) return null;
          try {
            const triggerRes = await interventionsApi.getTrigger(
              props.studyId,
              intervention.interventionId,
            );
            if (triggerRes.data?.type === 'api-trigger') {
              return intervention;
            }
          } catch {
            // no trigger for this intervention
          }
          return null;
        }),
      );

      apiTriggerInterventions.value = withTriggers.filter(
        (i): i is Intervention => i !== null,
      );
    } catch (e: any) {
      handleIndividualError(e, 'Cannot list interventions');
    }
  }

  async function listTokens(): Promise<void> {
    tokenList.value = [];
    await loadApiTriggerInterventions();

    for (const intervention of apiTriggerInterventions.value) {
      if (!intervention.interventionId) continue;
      try {
        const response = await axios.get(
          `/api/v1/studies/${props.studyId}/interventions/${intervention.interventionId}/tokens`,
        );
        const tokens = response.data;
        for (const token of tokens) {
          tokenList.value.push({
            interventionId: intervention.interventionId,
            interventionTitle: intervention.title || '',
            tokenId: token.tokenId,
            tokenLabel: token.tokenLabel,
            created: token.created,
          });
        }
      } catch (e: any) {
        handleIndividualError(
          e,
          `Could not get tokens for intervention: ${intervention.interventionId}`,
        );
      }
    }
  }

  async function createToken(data: {
    interventionId: number;
    tokenLabel: string;
  }): Promise<void> {
    try {
      const response = await axios.post(
        `/api/v1/studies/${props.studyId}/interventions/${data.interventionId}/tokens`,
        {
          tokenId: 0,
          tokenLabel: data.tokenLabel,
          created: '',
          token: '',
        },
      );
      const token = response.data;

      openCopyDialog(token);
      listTokens();
    } catch (e: any) {
      handleIndividualError(e, 'Cannot create intervention token');
    }
  }

  async function deleteToken(row: InterventionTokenTableMap): Promise<void> {
    try {
      await axios.delete(
        `/api/v1/studies/${props.studyId}/interventions/${row.interventionId}/tokens/${row.tokenId}`,
      );
      listTokens();
    } catch (e: any) {
      handleIndividualError(
        e,
        `Cannot delete token: ${row.tokenId}`,
      );
    }
  }

  function openCreateDialog(): void {
    dialog.open(InterventionTokenDialog, {
      data: {
        interventionList: apiTriggerInterventions.value,
      },
      props: {
        header: t('interventionToken.dialog.header.create'),
        style: { width: '50vw' },
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
          createToken(options.data);
        }
      },
    });
  }

  function openCopyDialog(token: {
    tokenId: number;
    tokenLabel: string;
    token: string;
  }): void {
    dialog.open(CopyTriggerTokenDialog, {
      data: {
        title: `${token.tokenLabel} (Id: ${token.tokenId})`,
        message: t('interventionToken.dialog.msg.createdToken'),
        highlightMsg: token.token,
      },
      props: {
        header: t('interventionToken.dialog.header.tokenCopy'),
        style: { width: '50vw' },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
      },
    });
  }

  listTokens();
</script>

<template>
  <div class="intervention-token-list mt-8">
    <MoreTable
      row-id="tokenId"
      :sort-options="sortOptions"
      :title="$t('interventionToken.tokenList.title')"
      :subtitle="$t('interventionToken.tokenList.description')"
      :columns="tokenColumns"
      :rows="tokenList"
      :row-actions="rowActions"
      :row-edit-btn="false"
      :loading="loader.isLoading.value"
      :editable-access="actionsVisible"
      :editable-user-roles="[StudyRole.StudyAdmin, StudyRole.StudyOperator]"
      :empty-message="$t('interventionToken.tokenList.emptyListMsg')"
      class="table-title-width table-btn-min-height"
      @on-action="executeAction($event)"
    >
      <template #tableActions>
        <div>
          <Button
            type="button"
            icon="pi pi-plus"
            :label="t('interventionToken.tokenList.action.add')"
            :disabled="!actionsVisible || apiTriggerInterventions.length === 0"
            @click="openCreateDialog"
          />
        </div>
      </template>
    </MoreTable>
  </div>

  <DynamicDialog />
</template>

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
  import MoreTable from './shared/MoreTable.vue';
  import useLoader from '../composable/useLoader';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';

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

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyStatus: { type: String as PropType<StudyStatus>, required: true },
  });

  const sortOptions: MoreTableSortOptions = {
    sortField: 'tokenLabel',
    sortOrder: 1,
  };

  const actionsVisible = props.studyStatus !== StudyStatus.Closed;
  const appOrigin = window.location.origin;

  const tokenList: Ref<InterventionTokenTableMap[]> = ref([]);
  const showCreateForm: Ref<boolean> = ref(false);
  const newTokenLabel: Ref<string> = ref('');
  const selectedInterventionId: Ref<number | null> = ref(null);
  const apiTriggerInterventions: Ref<Intervention[]> = ref([]);

  // Token dialog state
  const showTokenDialog: Ref<boolean> = ref(false);
  const createdTokenLabel: Ref<string> = ref('');
  const createdTokenId: Ref<number> = ref(0);
  const createdTokenValue: Ref<string> = ref('');
  const tokenCopied: Ref<boolean> = ref(false);

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

  async function createToken(): Promise<void> {
    if (!selectedInterventionId.value || !newTokenLabel.value.trim()) return;

    try {
      const response = await axios.post(
        `/api/v1/studies/${props.studyId}/interventions/${selectedInterventionId.value}/tokens`,
        {
          tokenId: 0,
          tokenLabel: newTokenLabel.value.trim(),
          created: '',
          token: '',
        },
      );
      const token = response.data;

      showCreateForm.value = false;
      newTokenLabel.value = '';
      selectedInterventionId.value = null;

      createdTokenLabel.value = token.tokenLabel;
      createdTokenId.value = token.tokenId;
      createdTokenValue.value = token.token;
      tokenCopied.value = false;
      showTokenDialog.value = true;

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

  function copyToken(): void {
    navigator.clipboard.writeText(createdTokenValue.value);
    tokenCopied.value = true;
  }

  function closeTokenDialog(): void {
    showTokenDialog.value = false;
  }

  function openCreateForm(): void {
    showCreateForm.value = true;
    showTokenDialog.value = false;
    newTokenLabel.value = '';
    selectedInterventionId.value =
      apiTriggerInterventions.value.length === 1
        ? (apiTriggerInterventions.value[0].interventionId ?? null)
        : null;
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
            v-if="!showCreateForm"
            type="button"
            icon="pi pi-plus"
            :label="t('interventionToken.tokenList.action.add')"
            :disabled="!actionsVisible || apiTriggerInterventions.length === 0"
            @click="openCreateForm"
          />
        </div>
      </template>
    </MoreTable>

    <!-- Create token form -->
    <div v-if="showCreateForm" class="create-token-form mt-4 rounded-lg border p-4">
      <h6 class="mb-3 font-bold">{{ t('interventionToken.dialog.header.create') }}</h6>

      <div class="mb-3">
        <label class="mb-1 block font-medium">
          {{ t('interventionToken.dialog.label.chooseIntervention') }}
        </label>
        <select
          v-model="selectedInterventionId"
          class="w-full rounded border p-2"
        >
          <option :value="null" disabled>
            {{ t('interventionToken.dialog.placeholder.selectIntervention') }}
          </option>
          <option
            v-for="intervention in apiTriggerInterventions"
            :key="intervention.interventionId"
            :value="intervention.interventionId"
          >
            {{ intervention.title }} (ID: {{ intervention.interventionId }})
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="mb-1 block font-medium">
          {{ t('interventionToken.dialog.label.tokenLabel') }}
        </label>
        <InputText
          v-model="newTokenLabel"
          :placeholder="t('interventionToken.dialog.placeholder.tokenLabelInput')"
          class="w-full"
        />
      </div>
      
      <div class="flex gap-2">
        <Button
          type="button"
          class="p-button"
          :label="t('global.labels.save')"
          :disabled="!selectedInterventionId || !newTokenLabel.trim()"
          @click="createToken"
        />
        <Button
          type="button"
          class="btn-gray"
          :label="t('global.labels.cancel')"
          @click="showCreateForm = false"
        />
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showTokenDialog" class="itl-overlay" @click.self="closeTokenDialog">
      <div class="itl-dialog">
        <div class="itl-dialog-header">
          <span class="itl-dialog-title">{{ t('interventionToken.dialog.header.tokenCopy') }}</span>
          <button type="button" class="itl-close-btn" @click="closeTokenDialog">&times;</button>
        </div>
        <div class="itl-dialog-body">
          <p style="font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem;">
            {{ createdTokenLabel }} (Id: {{ createdTokenId }})
          </p>
          <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.9rem;">
            {{ t('interventionToken.dialog.msg.createdToken') }}
          </p>

          <div class="itl-token-box">
            <code class="itl-token-text">{{ createdTokenValue }}</code>
            <Button
              type="button"
              icon="pi pi-copy"
              class="p-button-outlined p-button-sm"
              :label="t('interventionToken.dialog.label.copyToken')"
              @click="copyToken"
            />
          </div>

          <div v-if="tokenCopied" class="itl-copy-ok">
            {{ t('interventionToken.dialog.label.copySuccess') }}
          </div>

          <div class="itl-info-box" style="margin-top: 1rem;">
            <p style="font-weight: 700; margin-bottom: 0.5rem;">
              {{ t('interventionToken.dialog.example.endpointTitle') }}
            </p>
            <table style="width: 100%; font-size: 0.85rem;">
              <tbody>
                <tr><td style="font-weight: 600; width: 80px; padding: 2px 8px;">Method</td><td><code>POST</code></td></tr>
                <tr><td style="font-weight: 600; padding: 2px 8px;">URL</td><td><code>/api/v1/trigger/external</code></td></tr>
                <tr><td style="font-weight: 600; padding: 2px 8px;">Header</td><td><code>More-Api-Token: &lt;your-token&gt;</code></td></tr>
                <tr><td style="font-weight: 600; padding: 2px 8px;">Body</td><td><code>{"participantIds": [1, 2, ...]}</code></td></tr>
              </tbody>
            </table>
          </div>

          <div style="margin-top: 1rem;">
            <p style="font-weight: 700; margin-bottom: 0.5rem;">
              {{ t('interventionToken.dialog.example.triggerTitle') }}
            </p>
            <pre class="itl-curl">curl -X POST {{ appOrigin }}/api/v1/trigger/external \
                                  -H "Content-Type: application/json" \
                                  -H "More-Api-Token: {{ createdTokenValue }}" \
                                  -d '{"participantIds": [1, 2]}'</pre>
          </div>

          <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
            <Button
              type="button"
              class="btn-gray"
              :label="$t('global.labels.close')"
              @click="closeTokenDialog"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
  /* NOT scoped — needed for Teleport content */
  .itl-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  .itl-dialog {
    background: #fff;
    border-radius: 8px;
    width: 50vw;
    max-width: 700px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 960px) {
    .itl-dialog { width: 75vw; }
  }
  @media (max-width: 640px) {
    .itl-dialog { width: 92vw; }
  }

  .itl-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 8px 8px 0 0;
  }

  .itl-dialog-title {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .itl-close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #6b7280;
    line-height: 1;
    padding: 0 4px;
  }
  .itl-close-btn:hover {
    color: #111;
  }

  .itl-dialog-body {
    padding: 1.5rem;
  }

  .itl-token-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #f3f4f6;
    margin-bottom: 0.5rem;
  }

  .itl-token-text {
    flex: 1;
    word-break: break-all;
    font-size: 0.88rem;
    color: #2563eb;
    user-select: all;
    font-weight: 600;
  }

  .itl-copy-ok {
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    background: #ecfdf5;
    color: #047857;
    margin-bottom: 0.5rem;
  }

  .itl-info-box {
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #f9fafb;
  }

  .itl-curl {
    padding: 0.75rem;
    border-radius: 6px;
    background: #1f2937;
    color: #e5e7eb;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>

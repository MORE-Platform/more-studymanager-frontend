/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { StudyGroup } from '../../generated-sources/openapi';
  import { MoreTableColumn } from '../../models/MoreTableModel';
  import { useI18n } from 'vue-i18n';
  import MoreTable from '../shared/MoreTable.vue';
  import WarningSection from './shared/WarningSection.vue';

  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const studyGroups: Array<StudyGroup> =
    dialogRef.value.data?.studyGroups || [];

  function closeDialog() {
    dialogRef.value.close();
  }
  function distribute() {
    dialogRef.value.close(true);
  }

  const studyGroupColumns: MoreTableColumn[] = [
    { field: 'title', header: t('studyGroup.groupList.placeholder.title') },
    { field: 'purpose', header: t('study.props.purpose') },
  ];
</script>

<template>
  <div class="dialog">
    <div class="mb-6">
      {{ $t('participants.participantsList.distributeMsg.intro') }}
    </div>
    <h3 v-if="studyGroups.length" class="font-medium">
      <span class="text-color">
        {{ $t('studyGroup.plural') }} ({{ studyGroups.length }})</span
      >
    </h3>

    <div v-if="studyGroups.length" class="mb-10">
      <MoreTable
        :rows="studyGroups"
        :columns="studyGroupColumns"
        row-id="title"
        :editable-access="false"
        :class="'table-data-preview'"
        :paginator="true"
        :paginator-rows="5"
      />
    </div>
    <WarningSection
      :confirm-msg="t('participants.participantsList.distributeMsg.confirm')"
      :warning-msg="t('participants.participantsList.distributeMsg.warning')"
    />

    <div class="flex justify-end">
      <Button
        type="button"
        class="p-button btn-gray !mr-3"
        @click="closeDialog"
      >
        {{ $t('global.labels.close') }}
      </Button>
      <Button
        type="button"
        class="p-button btn-important ml-2"
        @click="distribute"
      >
        {{ $t('participants.dialog.btn.distributeBtn') }}
      </Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .table-data-preview {
    :deep(.p-datatable) {
      .row-actions {
        display: none;
      }
      th,
      td {
        padding: 0.7rem;
        width: 50%;
      }
    }
  }
</style>

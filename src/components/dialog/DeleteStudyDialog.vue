/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { useStudyStore } from '../../stores/studyStore';
  import { Study } from '../../generated-sources/openapi';
  import WarningSection from './shared/WarningSection.vue';

  const studyStore = useStudyStore();

  const infoDialogRef: any = inject('dialogRef');
  const introMsg: string = infoDialogRef?.value?.data?.introMsg;
  const warningMsg: string = infoDialogRef?.value?.data?.warningMsg;
  const confirmMsg: string = infoDialogRef?.value?.data?.confirmMsg;
  const study: Study = infoDialogRef?.value?.data?.study;

  function deleteStudy() {
    studyStore.deleteStudy(study.studyId);
    infoDialogRef.value.close();
  }
  function closeDialog() {
    infoDialogRef.value.close();
  }
</script>

<template>
  <div class="dialog delete-confirm-dialog">
    <div class="mb-6">{{ introMsg }}</div>
    <h3 class="mb-7 font-medium">
      <span
        class="status text-color mr-2 rounded p-1 pl-2 text-center uppercase"
        :class="[
          [study.status == 'active' ? 'active text-green-400' : ''],
          [
            study.status === 'paused' || study.status === 'draft'
              ? 'draft text-gray-400'
              : '',
          ],
        ]"
      >
        {{ study.status }}
      </span>
      <span class="text-color"> Id {{ study.studyId }}: </span>
      <span class="color-primary">{{ study.title }}</span>
    </h3>
    <div v-if="study.purpose" class="mb-10">
      <h5>{{ $t('study.props.purpose') }}</h5>
      <div>{{ study.purpose }}</div>
    </div>

    <WarningSection :confirm-msg="confirmMsg" :warning-msg="warningMsg" />

    <div class="flex justify-end gap-2">
      <Button type="button" class="p-button btn-gray" @click="closeDialog">
        {{ $t('global.labels.close') }}
      </Button>
      <Button type="button" class="p-button btn-important" @click="deleteStudy">
        {{ $t('global.labels.delete') }}
      </Button>
      <Button
        type="button"
        class="p-button btn-important disabled"
        disabled
        @click="deleteStudy"
        >{{ $t('participants.dialog.deleteMsg.deleteWithData') }}</Button
      >
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .delete-confirm-dialog {
    font-size: 1rem;
  }
  h5 {
    font-size: 18px;
    font-weight: bold;
  }
  .status {
    border: 2px solid var(--text-color);
    &.active {
      border-color: var(--green-400);
    }
    &.draft {
      border-color: var(--gray-400);
    }
  }

  .disabled {
    pointer-events: none;
  }
</style>

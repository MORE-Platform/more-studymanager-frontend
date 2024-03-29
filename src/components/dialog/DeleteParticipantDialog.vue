/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { Participant } from '../../generated-sources/openapi';
  import WarningSection from './shared/WarningSection.vue';

  const dialogRef: any = inject('dialogRef');
  const introMsg: string = dialogRef?.value?.data?.introMsg;
  const warningMsg: string = dialogRef?.value?.data?.warningMsg;
  const confirmMsg: string = dialogRef?.value?.data?.confirmMsg;
  const participant: Participant = dialogRef?.value?.data?.participant;

  function deleteParticipant(withData: boolean) {
    dialogRef.value.close({ participant, withData });
  }

  function closeDialog() {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog delete-confirm-dialog">
    <div class="mb-6">{{ introMsg }}</div>
    <h3 class="mb-7 font-medium">
      <span class="text-color">Id {{ participant.participantId }}: </span>
      <span class="color-primary"
        >{{ participant.alias }} ( {{ participant.status }} )</span
      >
    </h3>
    <WarningSection :confirm-msg="confirmMsg" :warning-msg="warningMsg" />

    <div class="flex justify-end">
      <Button type="button" class="p-button btn-gray mr-3" @click="closeDialog">
        {{ $t('global.labels.close') }}
      </Button>

      <Button
        type="button"
        class="p-button p-button-danger mr-3"
        @click="deleteParticipant(false)"
      >
        {{ $t('participants.dialog.deleteMsg.deleteWithoutData') }}
      </Button>

      <Button
        type="button"
        class="p-button p-button-danger"
        @click="deleteParticipant(true)"
      >
        {{ $t('participants.dialog.deleteMsg.deleteWithData') }}
      </Button>
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
  .mr-3 {
    margin-right: 0.5rem;
  }
</style>

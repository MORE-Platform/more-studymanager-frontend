/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { Participant } from '@gs';
  import WarningSection from './shared/WarningSection.vue';

  const dialogRef: any = inject('dialogRef');
  const introMsg: string = dialogRef?.value?.data?.introMsg;
  const warningMsg: string = dialogRef?.value?.data?.warningMsg;
  const confirmMsg: string = dialogRef?.value?.data?.confirmMsg;
  const participant: Participant = dialogRef?.value?.data?.participant;

  function deleteParticipant(withData: boolean): void {
    dialogRef.value.close({ participant, withData });
  }

  function closeDialog(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog text-base">
    <div class="mb-6">{{ introMsg }}</div>
    <h3 class="mb-7 font-medium">
      <span class="text-color">Id {{ participant.participantId }}: </span>
      <span class="color-primary"
        >{{ participant.alias }} ( {{ participant.status }} )</span
      >
    </h3>
    <WarningSection :confirm-msg="confirmMsg" :warning-msg="warningMsg" />

    <div class="flex justify-end">
      <Button
        type="button"
        class="p-button btn-gray !mr-3"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />

      <Button
        type="button"
        class="p-button p-button-danger !mr-3"
        :label="$t('participants.dialog.deleteMsg.deleteWithoutData')"
        @click="deleteParticipant(false)"
      />

      <Button
        type="button"
        class="p-button p-button-danger"
        :label="$t('participants.dialog.deleteMsg.deleteWithData')"
        @click="deleteParticipant(true)"
      />
    </div>
  </div>
</template>

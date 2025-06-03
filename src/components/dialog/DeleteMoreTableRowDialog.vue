/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import WarningSection from './shared/WarningSection.vue';

  const dialogRef: any = inject('dialogRef');
  const introMsg: string = dialogRef?.value?.data?.introMsg;
  const warningMsg: string = dialogRef?.value?.data?.warningMsg;
  const confirmMsg: string = dialogRef?.value?.data?.confirmMsg;
  const row: any = dialogRef?.value?.data?.row;
  const elTitle: string = dialogRef?.value?.data?.elTitle;
  const elInfoTitle: string = dialogRef?.value?.data?.elInfoTitle;
  const elInfoDesc: string = dialogRef?.value?.data?.elInfoDesc;

  function deleteRowEl(): void {
    dialogRef.value.close(row);
  }

  function closeDialog(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog text-base">
    <div class="mb-6">{{ introMsg }}</div>
    <h3 class="font-medium">
      <span class="color-primary">{{ elTitle }}</span>
    </h3>
    <div v-if="elInfoTitle && elInfoDesc" class="mt-5">
      <h5 class="text-lg font-bold">{{ elInfoTitle }}</h5>
      <div>{{ elInfoDesc }}</div>
    </div>

    <WarningSection :confirm-msg="confirmMsg" :warning-msg="warningMsg" />

    <div class="flex flex-row items-center justify-end">
      <Button
        type="button"
        class="p-button btn-gray !mr-3"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />
      <Button
        type="button"
        class="p-button btn-important ml-2"
        :label="$t('global.labels.delete')"
        @click="deleteRowEl"
      />
    </div>
  </div>
</template>

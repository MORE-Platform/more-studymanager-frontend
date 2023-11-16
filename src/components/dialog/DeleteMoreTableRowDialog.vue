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

  function deleteRowEl() {
    dialogRef.value.close(row);
  }

  function closeDialog() {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog delete-confirm-dialog">
    <div class="mb-6">{{ introMsg }}</div>
    <h3 class="font-medium">
      <span class="color-primary">{{ elTitle }}</span>
    </h3>
    <div v-if="elInfoTitle && elInfoDesc" class="mt-5">
      <h5>{{ elInfoTitle }}</h5>
      <div>{{ elInfoDesc }}</div>
    </div>

    <WarningSection :confirm-msg="confirmMsg" :warning-msg="warningMsg" />

    <div class="flex justify-end">
      <Button type="button" class="p-button btn-gray mr-3" @click="closeDialog">
        {{ $t('global.labels.close') }}
      </Button>
      <Button
        type="button"
        class="p-button btn-important ml-2"
        @click="deleteRowEl"
      >
        {{ $t('global.labels.delete') }}
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
  .btn-gray {
    margin-right: 0.5rem;
  }
</style>

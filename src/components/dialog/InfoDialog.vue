/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';

  const infoDialogRef: any = inject('dialogRef');
  const message: number = infoDialogRef?.value?.data?.message;

  function closeDialog(): void {
    infoDialogRef.value.close();
  }
</script>

<template>
  <div class="text-base">
    <div class="mb-8">{{ message }}</div>
    <div class="flex flex-row items-center justify-end">
      <Button
        type="button"
        class="btn-gray"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />
    </div>
  </div>
</template>

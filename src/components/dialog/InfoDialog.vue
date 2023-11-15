/* * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more *
contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute * for
Digital Health and Prevention -- A research institute of the * Ludwig Boltzmann
Gesellschaft, Oesterreichische Vereinigung zur * Foerderung der
wissenschaftlichen Forschung). * Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';

  const infoDialogRef: any = inject('dialogRef');
  const message: number = infoDialogRef?.value?.data?.message;

  function closeDialog() {
    infoDialogRef.value.close();
  }
</script>

<template>
  <div class="info-dialog">
    <div class="mb-8">{{ message }}</div>
    <div class="flex justify-end">
      <Button type="button" class="btn-gray" @click="closeDialog">{{
        $t('global.labels.close')
      }}</Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .info-dialog {
    font-size: 1rem;
  }
  h5 {
    font-size: 18px;
    font-weight: bold;
  }
</style>

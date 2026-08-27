/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import ExclamationIcon from '../shared/ExclamationIcon.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');

  const message: string = dialogRef.value?.data?.message ?? t('global.labels.leavePage');
  const cancelBtn: string = dialogRef.value?.data?.cancelBtn ?? t('global.labels.cancel');
  const approveBtn: string = dialogRef.value?.data?.approveBtn ?? t('global.labels.confirm');

  function closeDialog(navigate: boolean): void {
    dialogRef.value.close(navigate)
  }

</script>

<template>

  <div class="text-base">
    <div class="mb-8 grid grid-cols-12 place-items-center gap-4">
      <div class="col-span-2">
        <ExclamationIcon id="exclamation" />
      </div>
      <div class="col-span-10">
        {{message}}
      </div>
    </div>
    <div class="flex flex-row items-center justify-between">
      <Button
        type="button"
        class="p-button btn-important"
        :label="approveBtn"
        @click="closeDialog(true)"
      />
      <Button
        type="button"
        class="btn-primary"
        :label="cancelBtn"
        @click="closeDialog(false)"/>
    </div>
  </div>


</template>

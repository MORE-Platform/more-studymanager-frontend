/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { useI18n } from 'vue-i18n';
  import { useToast } from 'primevue/usetoast';
  import IntegrationExample from '../subComponents/IntegrationExample.vue';

  const infoDialogRef: any = inject('dialogRef');
  const title: string = infoDialogRef.value.data.title;
  const message: string = infoDialogRef.value.data.message;
  const token: string = infoDialogRef.value.data.highlightMsg;

  const { t } = useI18n();
  const toast = useToast();

  function copyToken(): void {
    navigator.clipboard.writeText(token).then(() => {
      toast.add({
        severity: 'success',
        summary: t('global.labels.success'),
        detail: t('integration.dialog.label.copySuccess'),
        life: 2000,
      });
    });
  }

  function closeDialog(): void {
    infoDialogRef.value.close();
  }
</script>

<template>
  <div class="text-base">
    <h5 class="text-large mb-2 font-bold">{{ title }}</h5>
    <div class="mb-4">{{ message }}</div>
    <div class="h6 color-primary cursor-pointer font-medium" @click="copyToken">
      {{ token }}
    </div>
    <IntegrationExample :token="token" />
    <div class="mt-8 flex flex-row items-center justify-end">
      <Button
        type="button"
        class="btn-gray"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />

      <Button
        type="button"
        class="p-button !ml-2"
        :label="$t('integration.dialog.label.copyToken')"
        @click="copyToken"
      />
    </div>
  </div>
</template>

<style scoped>
  .msg-position {
    height: fit-content;
  }
</style>

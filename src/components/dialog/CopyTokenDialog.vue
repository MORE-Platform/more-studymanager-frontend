/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import Button from 'primevue/button';
  import AlertMsg from '../shared/AlertMsg.vue';
  import { useI18n } from 'vue-i18n';
  import IntegrationExample from '../subComponents/IntegrationExample.vue';

  const infoDialogRef: any = inject('dialogRef');
  const title: string = infoDialogRef.value.data.title;
  const message: string = infoDialogRef.value.data.message;
  const token: string = infoDialogRef.value.data.highlightMsg;

  const { t } = useI18n();
  const showMessage: Ref<boolean> = ref(false);

  function copyToken(): void {
    navigator.clipboard.writeText(token);
    showMessage.value = true;
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

  <AlertMsg
    :show-msg="showMessage"
    :message="t('integration.dialog.label.copySuccess')"
    type="msg"
    severity-type="success"
    style-modifier="msg-position"
    @on-msg-change="showMessage = false"
  />
</template>

<style scoped lang="postcss">
  .msg-position {
    height: fit-content;
  }
</style>

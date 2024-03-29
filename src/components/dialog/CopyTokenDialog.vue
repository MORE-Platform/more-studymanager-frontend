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
  const title: string = infoDialogRef?.value?.data?.title;
  const message: string = infoDialogRef?.value?.data?.message;
  const token: string = infoDialogRef?.value?.data?.highlightMsg;

  const { t } = useI18n();
  const showMessage: Ref<boolean> = ref(false);

  function copyToken() {
    navigator.clipboard.writeText(token);
    showMessage.value = true;
  }

  function closeDialog() {
    infoDialogRef.value.close();
  }
</script>

<template>
  <div class="info-dialog">
    <h5 class="mb-2">{{ title }}</h5>
    <div class="mb-4">{{ message }}</div>
    <div class="h6 color-primary font-medium">{{ token }}</div>
    <IntegrationExample />
    <div class="mt-8 flex justify-end">
      <Button type="button" class="btn-gray" @click="closeDialog">{{
        $t('global.labels.close')
      }}</Button>

      <Button type="button" class="p-button ml-2" @click="copyToken">{{
        $t('integration.dialog.label.copyToken')
      }}</Button>
    </div>
  </div>

  <AlertMsg
    :show-msg="showMessage"
    :message="t('integration.dialog.label.copySuccess')"
    type="msg"
    severity-type="success"
    style-modifier="msgPosition"
    @on-msg-change="showMessage = false"
  />
</template>

<style scoped lang="postcss">
  .info-dialog {
    font-size: 1rem;
  }
  h5 {
    font-size: 18px;
    font-weight: bold;
  }
  .ml-2 {
    margin-left: 0.5rem;
  }
  .p-message {
    height: fit-content;
  }
  .msgPosition {
    bottom: 0;
  }
</style>

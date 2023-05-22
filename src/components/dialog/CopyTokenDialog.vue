<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import Button from 'primevue/button';
  import AlertMsg from '../shared/AlertMsg.vue';
  import { useI18n } from 'vue-i18n';

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
  .msgPosition {
    top: 200%;
  }
</style>

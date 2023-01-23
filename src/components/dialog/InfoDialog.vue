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
      <Button type="button" class="p-button" @click="closeDialog">{{ $t('global.dialog.close') }}</Button>
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

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import Button from 'primevue/button';
  import { StudyStatus } from '../../generated-sources/openapi';
  defineProps({
    status: {
      type: String,
      required: true,
    },
  });
  const emit = defineEmits<{ (e: 'onchange', status: StudyStatus): void }>();
</script>
<template>
  <div v-if="status === StudyStatus.Draft" class="buttons">
    <Button
      type="button"
      title="Start"
      @click="emit('onchange', StudyStatus.Active)"
      >{{ $t('study.statusChange.start') }}</Button
    >
    <!--icon="pi pi-play"-->
  </div>
  <div v-if="status === StudyStatus.Active" class="buttons">
    <Button
      type="button"
      title="Pause"
      @click="emit('onchange', StudyStatus.Paused)"
      >{{ $t('global.labels.setPause') }}</Button
    >
    <!--icon="pi pi-pause"-->
    <Button
      type="button"
      title="Close"
      @click="emit('onchange', StudyStatus.Closed)"
      >{{ $t('study.statusChange.complete') }}</Button
    >
    <!--icon="pi pi-stop-circle"-->
  </div>
  <div v-if="status === StudyStatus.Paused" class="buttons">
    <Button
      type="button"
      title="Resume"
      @click="emit('onchange', StudyStatus.Active)"
      >{{ $t('study.statusChange.resume') }}</Button
    >
    <!--icon="pi pi-play"-->
    <Button
      type="button"
      title="Close"
      @click="emit('onchange', StudyStatus.Closed)"
      >{{ $t('study.statusChange.complete') }}</Button
    >
    <!-- icon="pi pi-stop-circle"-->
  </div>
</template>

<style scoped lang="postcss">
  .buttons {
    display: flex;
    margin-right: 10px;

    :deep(button:first-of-type) {
      margin-right: 10px;
    }
  }
</style>

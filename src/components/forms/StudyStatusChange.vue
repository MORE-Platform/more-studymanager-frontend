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
      title="Preview"
      @click="emit('onchange', StudyStatus.Preview)"
      >{{ $t('study.statusChange.start-preview') }}</Button
    >
    <Button
      type="button"
      title="Start"
      @click="emit('onchange', StudyStatus.Active)"
      >{{ $t('study.statusChange.start') }}</Button
    >
  </div>
  <div v-if="status === StudyStatus.Preview" class="buttons">
    <Button
      type="button"
      title="Pause Preview"
      @click="emit('onchange', StudyStatus.PausedPreview)"
      >{{ $t('study.statusChange.pause') }}</Button
    >
    <Button
      type="button"
      title="Complete Preview"
      @click="emit('onchange', StudyStatus.Draft)"
      >{{ $t('study.statusChange.complete-preview') }}</Button
    >
  </div>
  <div v-if="status === StudyStatus.Active" class="buttons">
    <Button
      type="button"
      title="Pause"
      @click="emit('onchange', StudyStatus.Paused)"
      >{{ $t('study.statusChange.pause') }}</Button
    >
    <Button
      type="button"
      title="Close"
      @click="emit('onchange', StudyStatus.Closed)"
      >{{ $t('study.statusChange.complete') }}</Button
    >
  </div>
  <div v-if="status === StudyStatus.PausedPreview" class="buttons">
    <Button
      type="button"
      title="Resume Preview"
      @click="emit('onchange', StudyStatus.Preview)"
      >{{ $t('study.statusChange.resume-preview') }}</Button
    >
    <Button
      type="button"
      title="Complete Preview"
      @click="emit('onchange', StudyStatus.Draft)"
      >{{ $t('study.statusChange.complete-preview') }}</Button
    >
  </div>
  <div v-if="status === StudyStatus.Paused" class="buttons">
    <Button
      type="button"
      title="Resume"
      @click="emit('onchange', StudyStatus.Active)"
      >{{ $t('study.statusChange.resume') }}</Button
    >
    <Button
      type="button"
      title="Close"
      @click="emit('onchange', StudyStatus.Closed)"
      >{{ $t('study.statusChange.complete') }}</Button
    >
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

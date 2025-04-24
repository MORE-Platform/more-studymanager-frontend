/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import Button from 'primevue/button';
  import { StudyStatus } from '@gs';
  import { computed } from 'vue';

  const props = defineProps({
    status: {
      type: String,
      required: true,
    },
  });
  const emit = defineEmits<{ (e: 'onChange', status: StudyStatus): void }>();

  interface StatusButton {
    textKey: string;
    status: StudyStatus;
  }
  type StudyStatusWithoutClosed = Exclude<
    StudyStatus,
    typeof StudyStatus.Closed
  >;

  const buttonConfig: Record<StudyStatusWithoutClosed, StatusButton[]> = {
    [StudyStatus.Draft]: [
      {
        textKey: 'study.statusChange.start-preview',
        status: StudyStatus.Preview,
      },
      {
        textKey: 'study.statusChange.start',
        status: StudyStatus.Active,
      },
    ],
    [StudyStatus.Preview]: [
      {
        textKey: 'study.statusChange.pause-preview',
        status: StudyStatus.PausedPreview,
      },
      {
        textKey: 'study.statusChange.complete-preview',
        status: StudyStatus.Draft,
      },
    ],
    [StudyStatus.Active]: [
      { textKey: 'study.statusChange.pause', status: StudyStatus.Paused },
      { textKey: 'study.statusChange.complete', status: StudyStatus.Closed },
    ],
    [StudyStatus.PausedPreview]: [
      {
        textKey: 'study.statusChange.resume-preview',
        status: StudyStatus.Preview,
      },
      {
        textKey: 'study.statusChange.complete-preview',
        status: StudyStatus.Draft,
      },
    ],
    [StudyStatus.Paused]: [
      { textKey: 'study.statusChange.resume', status: StudyStatus.Active },
      { textKey: 'study.statusChange.complete', status: StudyStatus.Closed },
    ],
  };

  const filteredButtons = computed(() => {
    return buttonConfig[props.status as StudyStatusWithoutClosed] || [];
  });
</script>
<template>
  <div v-if="filteredButtons.length" class="flex items-baseline">
    <Button
      v-for="button in filteredButtons"
      :key="button.textKey"
      class="!mr-2.5"
      type="button"
      :title="$t(button.textKey)"
      :label="$t(button.textKey)"
      @click="emit('onChange', button.status)"
    />
  </div>
</template>

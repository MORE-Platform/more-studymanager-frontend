<script setup lang="ts">
  import { PropType } from 'vue';
  import { StudyStatus } from '../../generated-sources';

  defineProps({
    status: {
      type: String as PropType<StudyStatus>,
      required: true,
    },
  });
</script>

<template>
  <span class="status text-color" :class="status">
    {{ $t(`study.statusStrings.${status}`) }}
  </span>
</template>

<style scoped lang="postcss">
  .status {
    border: 2px solid var(--gray-400);
    border-radius: var(--border-radius);
    margin: 0 0.25rem;
    padding: 0.25rem;
    text-align: center;
    text-transform: uppercase;
    &.active {
      border-color: var(--green-400);
      color: var(--green-400);
    }
    &.preview {
      border-color: var(--green-400);
      color: var(--green-400);
      border-style: dashed;
    }
    &.paused-preview {
      border-color: var(--red-400);
      color: var(--red-400);
      border-style: dashed;
    }
    &.draft {
      border-color: var(--gray-400);
      color: var(--gray-400);
    }
    &.paused {
      border-color: var(--red-400);
      color: var(--red-400);
    }
    &.closed {
      border-color: var(--blue-400);
      color: var(--blue-400);
    }
  }
</style>

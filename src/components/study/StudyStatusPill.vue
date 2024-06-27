<script setup lang="ts">
  import { PropType } from 'vue';
  import { StudyStatus } from '../../generated-sources/openapi';

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
    border: 2px solid var(--text-color);
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
      border-color: var(--blue-400);
      color: var(--blue-400);
    }
    &.draft {
      border-color: var(--gray-400);
      color: var(--gray-400);
    }
  }
</style>

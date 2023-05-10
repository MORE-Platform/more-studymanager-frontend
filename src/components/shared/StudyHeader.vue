<script setup lang="ts">
  import { PropType } from 'vue';
  import { Study } from '../../generated-sources/openapi';

  defineProps({
    study: {
      type: Object as PropType<Study>,
      required: true,
    },
  });
</script>
<template>
  <div class="study-header mb-10 flex flex-row items-center">
    <div class="title-block">
      <h1>
        <span
          class="status-inline mr-2"
          :class="[
            [study.status === 'active' ? 'active' : ''],
            [study.status === 'paused' ? 'paused' : ''],
          ]"
          >{{ $t('study.statusStrings.' + study.status) }}</span
        >
        {{ study.title }}
      </h1>
      <!--<div>{{study.userRoles}}</div> -->
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .study-header {
    .status {
      font-size: 1.75rem;
      border: 0.188rem var(--border-style) var(--bluegray-800);
      border-radius: 0.25rem;
      padding: 0.875rem 2.063rem;
      text-transform: uppercase;
      font-weight: 600;

      &.active {
        color: var(--green-300);
        border-color: var(--green-300);
      }
      &.paused {
        color: var(--bluegray-500);
        border-color: var(--bluegray-500);
      }
    }

    .status-inline {
      text-transform: uppercase;
      border: calc(var(--border-weight) * 2) var(--border-style)
        var(--bluegray-800);
      padding: 0.313rem;
      border-radius: 0.25rem;
      font-size: 1.5rem;
      color: var(--bluegray-800);

      &.active {
        color: var(--green-300);
        border-color: var(--green-300);
      }
      &.paused {
        color: var(--gray-500);
        border-color: var(--gray-500);
      }
    }

    .title-block {
      h1 {
        font-size: 1.75rem;
        color: var(--primary-color);
      }
      .study-id {
        font-size: 1.25rem;
      }
    }
  }
</style>

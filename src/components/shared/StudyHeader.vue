<script setup lang="ts">
import {PropType} from 'vue';
import {Study} from '../../generated-sources/openapi';
defineProps({
  study: {
    type: Object as PropType <Study>,
    required: true
  }
});
</script>
<template>
  <div class="flex flex-row study-header">
    <div class="mr-5 status flex items-center" :class="[[study.status === 'active' ? 'active' : ''], [study.status === 'paused' ? 'paused' : '']]">{{study.status}}</div>
    <div class="title-block">
      <h1>Study: {{study.title}}</h1>
      <div class="study-id"><span class="font-bold">Study ID:</span> {{study.studyId}}</div>
    </div>
  </div>
</template>
<style lang="postcss">
.study-header {
  .status {
    font-size: 28px;
    border: 3px solid black;
    border-radius: 4px;
    padding: 14px 33px;
    text-transform: uppercase;
    font-weight: 600;

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
      font-size: 28px;
      color: var(--primary-color);
    }
    .study-id {
      font-size: 20px;
    }
  }

}
</style>

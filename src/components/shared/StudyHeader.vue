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
  <div class="flex flex-row items-center study-header mb-10">
    <div class="title-block">
      <h1><span class="status-inline mr-2" :class="[[study.status === 'active' ? 'active' : ''], [study.status === 'paused' ? 'paused' : '']]">{{study.status}}</span>
        {{study.title}}</h1>
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

  .status-inline {
    text-transform: uppercase;
    border: 2px solid black;
    padding: 5px;
    border-radius: 4px;
    font-size: 24px;
    color: black;

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

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { PropType } from 'vue';
  import { Study } from '../../generated-sources';
  import StudyStatusPill from '../study/StudyStatusPill.vue';

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
        <StudyStatusPill :status="study.status!"></StudyStatusPill>
        {{ study.title }}
      </h1>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .study-header {
    .title-block {
      h1 {
        font-size: 1.75rem;
        color: var(--primary-color);
      }
    }
  }
</style>

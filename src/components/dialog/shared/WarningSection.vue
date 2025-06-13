/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import ExclamationIcon from '../../shared/ExclamationIcon.vue';

  defineProps({
    warningMsg: {
      type: String,
      required: true,
    },
    confirmMsg: {
      type: String,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });
</script>

<template>
  <div class="mb-8 mt-10 px-14">
    <div class="grid grid-cols-12 place-items-center gap-4">
      <div class="col-span-2">
        <ExclamationIcon id="exclamation" />
      </div>
      <div class="col-span-10">
        <div class="mb-2">
          {{ warningMsg }}
        </div>
        <div class="font-medium text-red-600">
          {{ confirmMsg }}
        </div>
      </div>
    </div>
  </div>
</template>

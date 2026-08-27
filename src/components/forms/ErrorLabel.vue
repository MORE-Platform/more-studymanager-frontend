/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
<template>
  <div v-if="error" class="error-label error mt-2">
    {{ Array.isArray(error) ? error.find((e) => !!e) : error }}
  </div>
</template>
<script setup lang="ts">
  defineProps<{ error?: string | string[] | null }>();
</script>

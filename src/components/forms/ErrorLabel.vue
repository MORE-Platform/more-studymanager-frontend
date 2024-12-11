<template>
  <div v-if="error" class="error-label error mt-2">
    {{ Array.isArray(error) ? error.find((e) => !!e) : error }}
  </div>
</template>
<script setup lang="ts">
  defineProps<{ error?: string | string[] | null }>();
</script>

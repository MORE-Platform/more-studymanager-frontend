<script setup lang="ts"></script>

<template>
  <TestButton></TestButton>
</template>

<script>
  import TestButton from './components/TestButton.vue';
  export default {
    components: { TestButton },
  };
</script>
<style scoped lang="postcss">
  main {
    min-height: 85vh;
    margin-bottom: 5.5rem;
  }
</style>

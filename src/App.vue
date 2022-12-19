<script setup lang="ts">
  import Footer from './components/shared/Footer.vue';
  import Header from './components/shared/Header.vue';
</script>

<template>
  <Header />
  <main class="pt-20">
    <router-view />
  </main>
  <Footer />
</template>

<style lang="postcss">
  main {
    min-height: 85vh;
    margin-bottom: 5.5rem;
  }
</style>

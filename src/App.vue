/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import Footer from './components/shared/Footer.vue';
  import Header from './components/shared/Header.vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();

  router.beforeEach((to) => {
    document.title = (to.meta?.title as string) + ' (More)' ?? 'More';
  });
</script>

<template>
  <Header />
  <main class="pt-20">
    <router-view />
  </main>
  <Footer />
</template>

<style scoped lang="postcss">
  main {
    min-height: 85vh;
    margin-bottom: 5.5rem;
  }
</style>

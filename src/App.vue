/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { ref, provide } from 'vue';
  import Toast from 'primevue/toast';
  import Footer from './components/shared/Footer.vue';
  import Header from './components/shared/Header.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const toast = ref<Toast | null>(null);
  provide('toast', toast);

  router.beforeEach((to) => {
    document.title = to.meta?.title ? to.meta.title + ' (More)' : 'More';
  });
</script>

<template>
  <Header />
  <main class="mb-20 pt-14">
    <router-view />
    <Toast ref="toast" />
  </main>
  <Footer />
</template>

<style scoped lang="postcss">
  main {
    min-height: 85vh;
  }
</style>

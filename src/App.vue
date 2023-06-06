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

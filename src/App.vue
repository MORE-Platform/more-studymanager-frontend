<script setup lang="ts">
  import Footer from './components/shared/Footer.vue';
  import Header from './components/shared/Header.vue';
  import useLoader from './composable/useLoader';
  import axios, { AxiosError } from 'axios';

  const loader = useLoader();
  axios.interceptors.request.use(
    (config) => {
      loader.enable();
      return config;
    },
    (error: Error | AxiosError) => {
      loader.disable();

      return Promise.reject(error);
    }
  );
  axios.interceptors.response.use(
    (response) => {
      loader.disable();
      return response;
    },
    function (error) {
      loader.disable();
      return Promise.reject(error);
    }
  );
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

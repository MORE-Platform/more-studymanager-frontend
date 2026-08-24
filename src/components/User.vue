/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { useUserStore } from '../stores/userStore';
  const userStore = useUserStore();
</script>

<template>
  <div>
    <h2 v-if="userStore.userName">{{ userStore.userName }}</h2>
    <h3 v-if="userStore.userInstitution" class="font-normal">{{ userStore.userInstitution }}</h3>
  </div>
</template>

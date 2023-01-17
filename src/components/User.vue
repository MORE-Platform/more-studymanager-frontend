<script setup lang="ts">
  import { useUserStore } from '../stores/userStore';
  const userStore = useUserStore();
</script>

<template>
  <div>
    <h2 v-if="userStore.userName">{{ userStore.userName }}</h2>
    <h3 v-if="userStore.userInstitution">
      {{ userStore.userInstitution }}
    </h3>
  </div>
</template>

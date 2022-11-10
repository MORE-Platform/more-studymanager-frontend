<script setup lang="ts">
import {UserModel} from '../models/UserModel';
import {PropType} from 'vue';

defineProps({
  user: {
    type: Object as PropType<UserModel>,
    required: true
  }
})
</script>

<template>
  <div>
    <h2>{{user.name}}</h2>
    <h2><span>Organisation:</span>{{user.organisation}}</h2>
  </div>
</template>

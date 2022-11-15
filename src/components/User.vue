<script setup lang="ts">
import {PropType} from 'vue';
import {UserInfo} from '../generated-sources/openapi/models/user-info';

defineProps({
  user: {
    type: Object as PropType<UserInfo>,
    required: true
  }
})


</script>

<template>
  <div>
    <h2 v-if="user && user.name">{{user.name}}</h2>
    <h3 v-if="user && user.institution"><span>{{ $t('user.institution') }}:</span>{{user.institution}}</h3>
  </div>
</template>

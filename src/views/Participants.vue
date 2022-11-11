<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import {Study} from '../generated-sources/openapi';
import {useRoute} from 'vue-router';
const route = useRoute()
const study = route.meta['study'] as Study;
</script>

<template>
  <div class="container m-auto mt-10">
    <MoreTabNav :study-id="study?.studyId"></MoreTabNav>
    <h1>Participants</h1>
  </div>
</template>

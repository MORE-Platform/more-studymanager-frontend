<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import ParticipantList from "../components/ParticipantList.vue";
import {Study} from '../generated-sources/openapi';
import {useRoute} from 'vue-router';
const route = useRoute()
const study = route.meta['study'] as Study;
</script>

<template>
  <div class="container m-auto mt-10">
    <MoreTabNav :study-id="study?.studyId"></MoreTabNav>
    <ParticipantList class="mt-10" :study-id="study?.studyId"></ParticipantList>
  </div>
</template>

<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import StudyHeader from '../components/shared/StudyHeader.vue';
import {Study, StudyGroup} from '../generated-sources/openapi';
import {useRoute} from 'vue-router';
import ObservationList from '../components/ObservationList.vue'

const route = useRoute()
const study = route.meta['study'] as Study;
const studyGroups = route.meta['studyGroups'] as StudyGroup[];

</script>

<template>
  <div class="container m-auto mt-10">
    <MoreTabNav :study-id="study?.studyId"></MoreTabNav>
    <StudyHeader :study="study"></StudyHeader>
    <ObservationList :study-groups="studyGroups" :study-id="study.studyId" />
  </div>
</template>

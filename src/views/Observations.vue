<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import {Study} from '../generated-sources/openapi';
import {useRoute} from 'vue-router';
import ObservationList from '../components/ObservationList.vue'

const route = useRoute()
const study = route.meta['study'] as Study;

</script>

<template>
  <div class="container m-auto mt-10">
    <MoreTabNav :study-id="study?.studyId"></MoreTabNav>
    <h1>Observations</h1>
    <p>An observation can be sensor data from a mobile phone or a wearable device or information gathered from a questionnaire.</p>

    <ObservationList :study-status="study.status" :study-id="study.studyId" />
  </div>
</template>

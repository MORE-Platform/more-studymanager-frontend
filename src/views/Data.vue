<script setup lang="ts">
  import MoreTabNav from "../components/shared/MoreTabNav.vue";
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import {Study, StudyRole} from '../generated-sources/openapi';
  import {useRoute} from 'vue-router';
  const route = useRoute()
  const study = route.meta['study'] as Study;
</script>

<template>
  <div class="container m-auto mt-10" >
    <StudyHeader :study="study"></StudyHeader>
    <MoreTabNav :study-id="study?.studyId" :study-roles="study?.userRoles"></MoreTabNav>
    <div v-if="study?.userRoles.some(r => [StudyRole.Viewer].includes(r))" class="container bg-white p-10 rounded-lg">
        <div class="data-header-textblock">
          <h3>Data</h3>
          <h4>Data collected during the study will be visualized at this within this dashboard.</h4>
        </div>
      <DataView />
    </div>
  </div>
</template>

<style lang="pcss">
  .data-header-textblock {
    h3 {
      font-weight: 600;
    }
    h4 {
      font-size: 1rem;
    }
  }
</style>

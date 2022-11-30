<script setup lang="ts">
  import {useRoute} from "vue-router";
  import {Ref} from "vue";
  import {Study} from "../generated-sources/openapi";
  const route = useRoute()
  const study: Ref<Study> = route.meta['study'] as Ref<Study>;
  const kibanaUrl = study.value ?
    'https://kibana.platform-test.more.redlink.io/app/dashboards#/view/90b3d4d0-6ef9-11ed-9d37-37f3957fa3f8?_g=(filters:!((query:(match_phrase:(study_id.keyword:study_'+study.value.studyId+')))))' :
    'https://kibana.platform-test.more.redlink.io/app/dashboards#/view/90b3d4d0-6ef9-11ed-9d37-37f3957fa3f8?_g=(filters:!())'
</script>

<template>
  <div class="container m-auto mt-10 dataview">
      <div><span class="font-medium">Live Data Dashboard: </span>
         <a :href="kibanaUrl" target="_blank">Go to Kibana</a>
      </div>
  </div>
</template>

<style lang="postcss">
  .dataview {
    a {
      color: var(--primary-color);
      font-weight: 500;
    }
  }
</style>

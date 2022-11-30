<script setup lang="ts">
  import {useRoute} from "vue-router";
  import {Ref} from "vue";
  import {Study} from "../generated-sources/openapi";
  const route = useRoute()
  const study: Ref<Study> = route.meta['study'] as Ref<Study>;
  const kibanaUrl = study ? 'https://kibana.platform-test.more.redlink.io/app/dashboards#/view/e7a96e90-6fe8-11ed-9d37-37f3957fa3f8?_g=(filters:!((query:(match_phrase:(' + study.value.studyId + '.keyword:study_40)))))' : 'https://kibana.platform-test.more.redlink.io/app/dashboards#/view/90b3d4d0-6ef9-11ed-9d37-37f3957fa3f8?_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!f%2Cvalue%3A1000)%2Ctime%3A(from%3A\'2022-11-28T14%3A06%3A56.413Z\'%2Cto%3A\'2022-11-28T14%3A07%3A13.949Z\'))'
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

<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { Study, StudyGroup, StudyRole } from '../generated-sources/openapi';
  import { useRoute } from 'vue-router';
  import ObservationList from '../components/ObservationList.vue';

  const route = useRoute();
  const study = route.meta['study'] as Study;
  const studyGroups = route.meta['studyGroups'] as StudyGroup[];
</script>

<template>
  <div class="container m-auto mt-10">
    <StudyHeader :study="study"></StudyHeader>
    <MoreTabNav
      :study-id="study?.studyId"
      :study-roles="study?.userRoles"
    ></MoreTabNav>
    <div
      v-if="
        study?.userRoles.some((r) =>
          [StudyRole.Admin, StudyRole.Operator].includes(r)
        )
      "
      class="container rounded-lg bg-white p-10"
    >
      <Suspense>
        <ObservationList
          :study-groups="studyGroups"
          :study-id="study.studyId"
          :study-status="study.status"
        />
      </Suspense>
    </div>
  </div>
</template>

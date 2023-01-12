<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources/openapi';
  import ObservationList from '../components/ObservationList.vue';
  import { useStudyStore } from '../stores/studyStore';

  const studyStore = useStudyStore();
</script>

<template>
  <div class="container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.study?.studyId"
      :study-roles="studyStore.study?.userRoles"
    ></MoreTabNav>
    <div
      v-if="
        studyStore.study?.userRoles.some((r) =>
          [StudyRole.Admin, StudyRole.Operator].includes(r)
        )
      "
      class="container rounded-lg bg-white p-10"
    >
      <Suspense>
        <ObservationList
          :study-groups="studyStore.studyGroups"
          :study-id="studyStore.study.studyId"
          :study-status="studyStore.study.status"
        />
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources/openapi';
  import ObservationList from '../components/ObservationList.vue';
  import { useStudyStore } from '../stores/studyStore';
  import { useStudyGroupStore } from '../stores/studyGroupStore';

  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();
</script>

<template>
  <div class="container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.study?.studyId"
      :study-roles="studyStore.studyUserRoles"
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
          :study-groups="studyGroupStore.studyGroups"
          :study-id="studyStore.study.studyId"
          :study-status="studyStore.study.status"
        />
      </Suspense>
    </div>
  </div>
</template>

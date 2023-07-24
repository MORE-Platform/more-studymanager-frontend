<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  // integrationList
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyStatus } from '../generated-sources/openapi';
  import { useStudyStore } from '../stores/studyStore';
  import IntegrationList from '../components/IntegrationList.vue';

  const studyStore = useStudyStore();
</script>

<template>
  <div class="integration-view container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.studyId"
      :study-roles="studyStore.studyUserRoles"
    ></MoreTabNav>

    <Suspense>
      <div class="container rounded-lg bg-white p-10">
        <IntegrationList
          :study-id="studyStore.studyId"
          :actions-visible="
            studyStore.study.status === StudyStatus.Draft ||
            studyStore.study.status === StudyStatus.Paused
          "
        />
      </div>
    </Suspense>
  </div>
</template>

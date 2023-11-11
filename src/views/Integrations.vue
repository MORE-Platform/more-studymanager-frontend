/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Österreichische Vereinigung zur
 * Förderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
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
      <IntegrationList
        :study-id="studyStore.studyId"
        :actions-visible="
          studyStore.study.status === StudyStatus.Draft ||
          studyStore.study.status === StudyStatus.Paused
        "
      />
    </Suspense>
  </div>
</template>

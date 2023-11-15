/* * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more *
contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute * for
Digital Health and Prevention -- A research institute of the * Ludwig Boltzmann
Gesellschaft, Oesterreichische Vereinigung zur * Foerderung der
wissenschaftlichen Forschung). * Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources/openapi';
  import { useStudyStore } from '../stores/studyStore';
  import ParticipationDataList from '../components/ParticipationDataList.vue';

  const studyStore = useStudyStore();
  const accessRoles: StudyRole[] = [StudyRole.Viewer, StudyRole.Admin];
</script>

<template>
  <div class="container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.studyId"
      :study-roles="studyStore.studyUserRoles"
    ></MoreTabNav>
    <div
      v-if="
        studyStore.studyUserRoles.some((r: StudyRole) =>
          accessRoles.includes(r)
        )
      "
      class="container rounded-lg bg-white p-10"
    >
      <ParticipationDataList :study-id="studyStore.studyId" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .data-header-textblock {
    h3 {
      font-weight: 600;
    }
    h4 {
      font-size: 1rem;
    }
  }
</style>

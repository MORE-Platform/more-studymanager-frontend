/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '@gs';
  import { useStudyStore } from '@/stores/studyStore';
  import MilestoneList from '@/components/MilestoneList.vue';

  const studyStore = useStudyStore();

  const accessRoles: StudyRole[] = [
    StudyRole.StudyAdmin,
    StudyRole.StudyOperator,
  ];
</script>

<template>
  <div class="milestone-view container m-auto mt-10">
    <StudyHeader :study="studyStore.study" />
    <MoreTabNav
      :study-id="studyStore.studyId"
      :study-roles="studyStore.studyUserRoles"
    />
    <div
      v-if="
        studyStore.studyUserRoles.some((r: StudyRole) =>
          accessRoles.includes(r),
        )
      "
      class="container rounded-lg bg-white p-10"
    >
      <MilestoneList
        :study-id="studyStore.studyId"
        :study-status="studyStore.studyStatus"
      />
    </div>
  </div>
</template>

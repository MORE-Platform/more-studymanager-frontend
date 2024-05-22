/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources/openapi';
  import ObservationList from '../components/ObservationList.vue';
  import { useStudyStore } from '../stores/studyStore';
  import { useStudyGroupStore } from '../stores/studyGroupStore';

  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();

  const accessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];
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
        studyStore.study?.userRoles?.some((r: StudyRole) =>
          accessRoles.includes(r),
        )
      "
      class="container rounded-lg bg-white p-10"
    >
      <Suspense>
        <ObservationList
          :study-groups="studyGroupStore.studyGroups"
          :study-id="studyStore.studyId"
          :study-status="studyStore.studyStatus"
        />
      </Suspense>
    </div>
  </div>
</template>

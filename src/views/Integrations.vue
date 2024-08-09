/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { useStudyStore } from '../stores/studyStore';
  import IntegrationList from '../components/IntegrationList.vue';
  import { StudyRole } from '../generated-sources/openapi';

  const studyStore = useStudyStore();

  const accessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];
</script>

<template>
  <div class="integration-view container m-auto mt-10">
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
      <Suspense>
        <IntegrationList
          :study-id="studyStore.studyId"
          :study-status="studyStore.studyStatus"
        />
      </Suspense>
    </div>
  </div>
</template>

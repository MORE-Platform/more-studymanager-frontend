/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import ParticipantList from '../components/ParticipantList.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources/openapi';
  import { useStudyStore } from '../stores/studyStore';
  import { useStudyGroupStore } from '../stores/studyGroupStore';
  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();

  const accessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];
</script>

<template>
  <div class="participant-view container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.studyId"
      :study-roles="studyStore.studyUserRoles"
    ></MoreTabNav>
    <div
      v-if="studyStore.studyUserRoles.some((r) => accessRoles.includes(r))"
      class="container rounded-lg bg-white p-10"
    >
      <ParticipantList
        :study-groups="studyGroupStore.studyGroups"
        :status-status="studyStore.studyStatus"
        :study-id="studyStore.studyId"
      ></ParticipantList>
    </div>
  </div>
</template>

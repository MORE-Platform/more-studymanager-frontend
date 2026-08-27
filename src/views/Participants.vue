/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import ParticipantList from '../components/ParticipantList.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { useStudyStore } from '../stores/studyStore';
  import { useObservationGroupStore } from '../stores/observationGroupStore';
  import { onMounted } from 'vue';

  const studyStore = useStudyStore();
  const observationGroupStore = useObservationGroupStore();

  onMounted(() => {
    if (observationGroupStore.observationGroups.length === 0) {
      observationGroupStore.getObservationGroups(studyStore.studyId);
    }
  });
</script>

<template>
  <div class="participant-view container m-auto mt-10">
    <StudyHeader :study="studyStore.study" />
    <MoreTabNav
      :study-id="studyStore.studyId"
      :study-roles="studyStore.studyUserRoles"
    />
    <div
      v-if="studyStore.hasCriticalRoles"
      class="container rounded-lg bg-white p-10"
    >
      <ParticipantList />
    </div>
  </div>
</template>

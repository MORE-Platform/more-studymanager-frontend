/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import { useRoute } from 'vue-router';
  import StudyGroupList from '../components/StudyGroupList.vue';
  import OverviewEditDetails from '../components/forms/Overview-EditDetails.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import StudyCollaboratorList from '../components/StudyCollaboratorList.vue';
  import { useStudyStore } from '../stores/studyStore';
  import { useStudyGroupStore } from '../stores/studyGroupStore';

  const route = useRoute();
  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();
  const studyId = parseInt(route.params.studyId as string);

  async function getStudyGroups() {
    await studyGroupStore.getStudyGroups(studyId);
  }

  studyStore.getStudy(studyId);
  getStudyGroups();
</script>

<template>
  <div class="overview-view container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyId"
      :study-roles="studyStore.studyUserRoles"
    ></MoreTabNav>
    <div class="container rounded-lg bg-white p-10">
      <OverviewEditDetails
        :style-modifier="'mb-16'"
        :study="studyStore.study"
        :user-roles="studyStore.studyUserRoles"
        @on-update-study="studyStore.updateStudy($event)"
        @on-update-study-status="studyStore.updateStudyStatus($event)"
      />

      <StudyGroupList
        :study-id="studyId"
        :user-roles="studyStore.studyUserRoles"
        :study-status="studyStore.studyStatus"
      />

      <StudyCollaboratorList
        :study-id="studyId"
        :user-roles="studyStore.studyUserRoles"
        :study-status="studyStore.studyStatus"
        :use-confirm-dialog="false"
        class="mt-20"
      />
      <div class="mb-30"></div>
    </div>
  </div>
</template>

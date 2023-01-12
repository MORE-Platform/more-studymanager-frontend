<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import { useRoute } from 'vue-router';
  import StudyGroupList from '../components/StudyGroupList.vue';
  import OverviewEditDetails from '../components/forms/Overview-EditDetails.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import StudyCollaboratorList from '../components/StudyCollaboratorList.vue';
  import { useStudyStore } from '../stores/studyStore';

  const route = useRoute();
  const studyStore = useStudyStore();
  const studyId = parseInt(route.params.studyId as string);

  studyStore.getStudy(studyId);
  studyStore.getStudyGroups(studyId);
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
        :study-status="studyStore.study.status"
      ></StudyGroupList>
      <StudyCollaboratorList
        :study-id="studyId"
        :user-roles="studyStore.studyUserRoles"
        :study-status="studyStore.study.status"
        :use-confirm-dialog="false"
        class="mt-20"
      />
    </div>
  </div>
</template>

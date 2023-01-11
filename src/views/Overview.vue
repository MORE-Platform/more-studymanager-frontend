<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import { useStudiesApi } from '../composable/useApi';
  import { useRoute } from 'vue-router';
  import { Ref, ref } from 'vue';
  import { Study, StudyStatus } from '../generated-sources/openapi';
  import StudyGroupList from '../components/StudyGroupList.vue';
  import OverviewEditDetails from '../components/forms/Overview-EditDetails.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import StudyCollaboratorList from '../components/StudyCollaboratorList.vue';

  const { studiesApi } = useStudiesApi();
  const route = useRoute();

  const study: Ref<Study> = route.meta['study'] as Ref<Study>;

  async function updateStudy(studyResponse: Study) {
    try {
      studiesApi.updateStudy(studyId, studyResponse).then((response) => {
        study.value = response.data;
      });
    } catch (e) {
      console.error("Couldn't update study " + studyId, e);
    }
  }

  async function updateStudyStatus(status: StudyStatus) {
    const statusBefore = study.value.status;
    study.value.status = status;
    studyStatus.value = status;
    studiesApi
      .setStatus(studyId, { status: status })
      .then(() => studiesApi.getStudy(studyId))
      .then((response) => {
        study.value = response.data;
      })
      .catch((e) => {
        study.value.status = statusBefore;
        alert('Could not update study status');
        console.error('Could not update study status', e);
      });
  }

  const studyId = +route.params.studyId;
  const studyStatus: Ref<StudyStatus> = ref(study.value.status as StudyStatus);
</script>

<template>
  <div class="overview-view container m-auto mt-10">
    <StudyHeader :study="study"></StudyHeader>
    <MoreTabNav
      :study-id="studyId"
      :study-roles="study?.userRoles"
    ></MoreTabNav>
    <div class="container rounded-lg bg-white p-10">
      <OverviewEditDetails
        :style-modifier="'mb-16'"
        :study="study"
        :user-roles="study?.userRoles"
        @on-update-study="updateStudy($event)"
        @on-update-study-status="updateStudyStatus"
      />
      <StudyGroupList
        :study-id="studyId"
        :user-roles="study?.userRoles"
        :study-status="studyStatus"
      ></StudyGroupList>
      <StudyCollaboratorList
        :study-id="studyId"
        :user-roles="study?.userRoles"
        :study-status="studyStatus"
        :use-confirm-dialog="false"
        class="mt-20"
      />
    </div>
  </div>
</template>

<style lang="postcss"></style>

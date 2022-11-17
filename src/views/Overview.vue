<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import {useStudiesApi} from '../composable/useApi';
import {useRoute} from 'vue-router';
import {Ref} from 'vue';
import {Study, StudyStatus} from '../generated-sources/openapi';
import StudyGroupList from '../components/StudyGroupList.vue';
import OverviewEditDetails from '../components/forms/Overview-EditDetails.vue'
import StudyHeader from '../components/shared/StudyHeader.vue';

const { studiesApi } = useStudiesApi()
const route = useRoute()

const study: Ref<Study> = route.meta['study'] as Ref<Study>;

async function updateStudy(studyResponse: Study) {

  try {
    studiesApi.updateStudy(studyId, studyResponse)
      .then(response => {
        study.value = response.data
      })
  } catch (e) {
    console.error("Couldn't update study " + studyId, e);
  }
}

async function updateStudyStatus(status: StudyStatus) {
  const statusBefore = study.value.status;
  study.value.status = status;
  studiesApi.setStatus(studyId, {status: status})
    .then(() => studiesApi.getStudy(studyId))
    .then(response => {
      study.value = response.data
    })
    .catch((e) => {
      study.value.status = statusBefore;
      alert('Could not update study status');
      console.error('Could not update study status', e);
    })
}

const studyId = +route.params.studyId;
</script>

<template>
  <div class="container m-auto mt-10 overview-view">
    <StudyHeader :study="study"></StudyHeader>
    <MoreTabNav :study-id="studyId"></MoreTabNav>
    <OverviewEditDetails :style-modifier="'mb-16'" :study="study" @on-update-study="updateStudy($event)" @on-update-study-status="updateStudyStatus" />
    <StudyGroupList :study-id="studyId"></StudyGroupList>
  </div>
</template>

<style lang="postcss">

</style>

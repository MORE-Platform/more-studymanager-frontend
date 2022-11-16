<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import {useStudiesApi, useStudyGroupsApi} from '../composable/useApi';
import {useRoute} from 'vue-router';
import {ref, Ref} from 'vue';
import {Study, StudyGroup} from '../generated-sources/openapi';
import StudyGroupList from '../components/StudyGroupList.vue';
import OverviewEditDetails from '../components/forms/Overview-EditDetails.vue'
import StudyHeader from '../components/shared/StudyHeader.vue';

const { studyGroupsApi } = useStudyGroupsApi()
const { studiesApi } = useStudiesApi()
const route = useRoute()

const study: Ref<Study> = route.meta['study'] as Ref<Study>;
const studyGroupList: Ref<StudyGroup[]> = ref([])

async function listStudyGroups(studyId:number): Promise<void> {
  try {
    studyGroupList.value = await studyGroupsApi.listStudyGroups(studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot list studies', e)
  }
}

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

const studyId = +route.params.studyId;
listStudyGroups(studyId);
</script>

<template>
  <div class="container m-auto mt-10 overview-view">
    <StudyHeader :study="study"></StudyHeader>
    <MoreTabNav :study-id="studyId"></MoreTabNav>
    <OverviewEditDetails :style-modifier="'mb-16'" :study="study" @on-update-study="updateStudy($event)" />
    <StudyGroupList :study-id="studyId"></StudyGroupList>
  </div>
</template>

<style lang="postcss">

</style>

<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import {useStudiesApi, useStudyGroupsApi} from '../composable/useApi';
import {useRoute} from 'vue-router';
import {ref, Ref} from 'vue';
import {Study, StudyGroup} from '../generated-sources/openapi';
import StudyGroupList from '../components/StudyGroupList.vue';
import OverviewEditDetails from '../components/forms/Overview-EditDetails.vue'

const { studyGroupsApi } = useStudyGroupsApi()
const { studiesApi } = useStudiesApi()
const route = useRoute()

const study: Ref<Study> = ref(route.meta['study'] as Study);
const studyGroupList: Ref<StudyGroup[]> = ref([])

async function listStudyGroups(studyId:number): Promise<void> {
  try {
    studyGroupList.value = []; //TODO necessary?
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
    <div v-if="study">

      <div class="flex flex-row">
        <div class="mr-5 status flex items-center" :class="[[study.status === 'active' ? 'active' : ''], [study.status === 'paused' ? 'paused' : '']]">{{study.status}}</div>
        <div class="title-block">
          <h1>Study: {{study.title}}</h1>
          <div class="study-id"><span class="font-bold">Study ID:</span> {{studyId}}</div>
        </div>
      </div>
      <MoreTabNav :study-id="studyId"></MoreTabNav>

      <OverviewEditDetails :style-modifier="'mb-16'" :study="study" @on-update-study="updateStudy($event)" />

      <StudyGroupList :study-id="studyId"></StudyGroupList>
    </div>
  </div>
</template>

<style lang="postcss">
  .overview-view {
    .status {
      font-size: 28px;
      border: 3px solid black;
      border-radius: 4px;
      padding: 14px 33px;
      text-transform: uppercase;
     font-weight: 600;

      &.active {
        color: var(--green-300);
        border-color: var(--green-300);
      }
      &.paused {
        color: var(--gray-500);
        border-color: var(--gray-500);
      }
    }

    .title-block {
      h1 {
        font-size: 28px;
        color: var(--primary-color);
      }
      .study-id {
        font-size: 20px;
      }
    }

  }
</style>

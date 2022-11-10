<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import {useStudiesApi, useStudyGroupsApi} from '../composable/useApi';
import {useRoute} from 'vue-router';
import {ref, Ref} from 'vue';
import {Study, StudyGroup} from '../generated-sources/openapi';
import StudyGroupList from '../components/StudyGroupList.vue';

const {studiesApi} = useStudiesApi()
const { studyGroupsApi } = useStudyGroupsApi()
const route = useRoute()

const study: Ref<Study|undefined> = ref()
const studyGroupList: Ref<StudyGroup[]> = ref([])

async function loadStudy(studyId:number): Promise<void> {
  try {
    study.value = undefined;
    study.value = await studiesApi.getStudy(studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot load study', e)
  }
}

async function listStudyGroups(studyId:number): Promise<void> {
  try {
    studyGroupList.value = []; //TODO necessary?
    studyGroupList.value = await studyGroupsApi.listStudyGroups(studyId).then((response) => response.data);
  } catch (e) {
    console.error('cannot list studies', e)
  }
}

const studyId = +route.params.studyId;
loadStudy(studyId);
listStudyGroups(studyId);
</script>

<template>
  <div class="container m-auto mt-10">
    <MoreTabNav :study-id="studyId"></MoreTabNav>
    <div v-if="study">
      <h1>Study: {{study.title}}</h1>
      <StudyGroupList :study-id="studyId"></StudyGroupList>
    </div>
  </div>
</template>

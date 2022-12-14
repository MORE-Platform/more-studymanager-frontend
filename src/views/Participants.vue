<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import ParticipantList from "../components/ParticipantList.vue";
import StudyHeader from '../components/shared/StudyHeader.vue';
import {Study, StudyGroup, StudyRole} from '../generated-sources/openapi';
import {useRoute} from 'vue-router';
import {useCollaboratorsApi, useUsersApi} from "../composable/useApi";
import {ref, Ref} from "vue";
import {AxiosResponse} from "axios";
const route = useRoute()
const study = route.meta['study'] as Study
const studyGroups = route.meta['studyGroups'] as StudyGroup[];

</script>

<template>
  <div class="participant-view container m-auto mt-10">
      <StudyHeader :study="study"></StudyHeader>
      <MoreTabNav :study-id="study?.studyId"></MoreTabNav>
      <div class="container bg-white p-10 rounded-lg">
        <ParticipantList :study-groups="studyGroups" :status-status="study?.status" :study-id="study?.studyId"></ParticipantList>
      </div>
    </div>
</template>

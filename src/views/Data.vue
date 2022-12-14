<script setup lang="ts">
import MoreTabNav from "../components/shared/MoreTabNav.vue";
import StudyHeader from '../components/shared/StudyHeader.vue';
import {Study, StudyRole, UserInfo} from '../generated-sources/openapi';
import {useRoute} from 'vue-router';
import DataView from '../components/DataView.vue'
import {useCollaboratorsApi, useUsersApi} from "../composable/useApi";
import {ref, Ref} from "vue";
import {AxiosResponse} from "axios";
const route = useRoute()
const study = route.meta['study'] as Study;

const { usersApi } = useUsersApi()
const { collaboratorsApi } = useCollaboratorsApi()
const studyRoles: Ref<StudyRole[]> = ref([])
async function getRoles(): Promise<void> {
  try {
    await usersApi.getCurrentUser()
      .then((response:AxiosResponse) => {
        collaboratorsApi.getStudyCollaboratorRoles(study.value.studyId as number, response.data.uid)
          .then((response: AxiosResponse) => {
            studyRoles.value = response.data.roles;
          })
      })
  } catch(e) {
    console.error('cannot read user access', e)
  }
}

getRoles();


</script>

<template>
  <div class="container m-auto mt-10">
    <StudyHeader :study="study"></StudyHeader>
    <MoreTabNav :study-id="study?.studyId" :study-roles="studyRoles"></MoreTabNav>
    <div v-if="access" class="container bg-white p-10 rounded-lg">
        <div class="data-header-textblock">
          <h3>Data</h3>
          <h4>Data collected during the study will be visualized at this within this dashboard.</h4>
        </div>
      <DataView />
    </div>
  </div>
</template>

<style lang="pcss">
  .data-header-textblock {
    h3 {
      font-weight: 600;
    }
    h4 {
      font-size: 1rem;
    }
  }

</style>

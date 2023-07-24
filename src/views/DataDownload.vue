<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { useStudyStore } from '../stores/studyStore';
  import { StudyRole } from '../generated-sources/openapi';
  import StudyDataDownloadList from '../components/StudyDataDownloadList.vue';

  const studyStore = useStudyStore();
  const accessRoles: StudyRole[] = [StudyRole.Viewer, StudyRole.Admin];
</script>

<template>
  <div class="data-download container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.studyId"
      :study-roles="studyStore.studyUserRoles"
    ></MoreTabNav>

    <div
      v-if="studyStore.studyUserRoles.some((r: StudyRole) => accessRoles.includes(r))"
      class="container rounded-lg bg-white p-10"
    >
      <StudyDataDownloadList
        :study-id="studyStore.studyId"
        :access-roles="accessRoles"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>

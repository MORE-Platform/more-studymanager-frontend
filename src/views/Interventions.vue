<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources/openapi';
  import InterventionsList from '../components/InterventionsList.vue';
  import { useStudyStore } from '../stores/studyStore';
  import { useStudyGroupStore } from '../stores/studyGroupStore';

  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();

  const accessRoles: StudyRole[] = [StudyRole.Admin, StudyRole.Operator];
</script>

<template>
  <div class="container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.study?.studyId"
      :study-roles="studyStore.studyUserRoles"
    ></MoreTabNav>
    <div
      v-if="studyStore.studyUserRoles.some((r) => accessRoles.includes(r))"
      class="container rounded-lg bg-white p-10"
    >
      <suspense>
        <InterventionsList
          :study-groups="studyGroupStore.studyGroups"
          :study-id="studyStore.study.studyId"
          :study-status="studyStore.study.status"
        />
      </suspense>
    </div>
  </div>
</template>

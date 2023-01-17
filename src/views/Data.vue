<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources/openapi';
  import DataView from '../components/DataView.vue';
  import { useStudyStore } from '../stores/studyStore';

  const studyStore = useStudyStore();
</script>

<template>
  <div class="container m-auto mt-10">
    <StudyHeader :study="studyStore.study"></StudyHeader>
    <MoreTabNav
      :study-id="studyStore.study?.studyId"
      :study-roles="studyStore.studyUserRoles"
    ></MoreTabNav>
    <div
      v-if="
        studyStore.studyUserRoles.some((r) =>
          [StudyRole.Viewer, StudyRole.Admin].includes(r)
        )
      "
      class="container rounded-lg bg-white p-10"
    >
      <div class="data-header-textblock">
        <h3>Data</h3>
        <h4>
          {{ $t('listDescription.data') }}
        </h4>
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

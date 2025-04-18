/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import MoreTabNav from '../components/shared/MoreTabNav.vue';
  import StudyHeader from '../components/shared/StudyHeader.vue';
  import { StudyRole } from '../generated-sources';
  import { useStudyStore } from '../stores/studyStore';
  import DataDownload from '../components/subComponents/DataDownload.vue';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import DatapointList from '../components/subComponents/DatapointList.vue';
  import ParticipationDataList from '../components/ParticipationDataList.vue';

  const studyStore = useStudyStore();
  const accessRoles: StudyRole[] = [
    StudyRole.StudyAdmin,
    StudyRole.StudyViewer,
  ];
</script>

<template>
  <div class="monitoring-data-view container m-auto mt-10">
    <StudyHeader :study="studyStore.study" />
    <MoreTabNav
      :study-id="studyStore.studyId"
      :study-roles="studyStore.studyUserRoles"
    />
    <div
      v-if="
        studyStore.studyUserRoles.some((r: StudyRole) =>
          accessRoles.includes(r),
        )
      "
      class="container rounded-lg bg-white p-10"
    >
      <TabView>
        <TabPanel :header="$t('monitoringData.tabs.lastDataPoints')">
          <DatapointList :study-id="studyStore.studyId" class="mb-14" />
        </TabPanel>
        <TabPanel :header="$t('monitoringData.tabs.recordedObservation')">
          <ParticipationDataList :study-id="studyStore.studyId" />
        </TabPanel>
        <TabPanel :header="$t('monitoringData.tabs.dataDownload')">
          <Suspense>
            <DataDownload />
          </Suspense>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

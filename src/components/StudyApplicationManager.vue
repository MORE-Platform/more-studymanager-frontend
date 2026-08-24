/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { computed } from 'vue';

  import { useStudyApplications } from '../api/applicationQueries';
  import { useI18n } from 'vue-i18n';
  import Checkbox from 'primevue/checkbox';
  import { useStudyStore } from '../stores/studyStore';
  import { useToast } from 'primevue/usetoast';

  const studyStore = useStudyStore();
  const toast = useToast();

  const { t } = useI18n();
  const { data: availableApplications, isLoading } = useStudyApplications(
    studyStore.studyId,
  );

  const applicationOptions = computed(() =>
    (availableApplications.value || []).map((val) => ({
      value: val,
      label: t(`study.applications.label.${val}`),
    })),
  );

  const updateApplicationAccess = (applicationId: string): void => {
    studyStore.updateStudy(studyStore.study).then(() => {
      const isActive = !!studyStore.study.applicationAccess?.find(
        (item) => item === applicationId,
      );
      toast.add({
        severity: 'success',
        summary: isActive
          ? t('study.applications.message.activatedTitle')
          : t('study.applications.message.deactivatedTitle'),
        detail: isActive
          ? t('study.applications.message.activated')
          : t('study.applications.message.deactivated'),
        life: 2000,
      });
    });
  };
</script>

<template>
  <div class="study-application-manager mt-10">
    <div class="mb-4">
      <h3 class="text-xl font-bold">
        {{ t('study.applications.title') }}
      </h3>
      <div class="text-lg">{{ t('study.applications.description') }}</div>
    </div>
    <div class="flex flex-wrap items-center gap-4">
      <div
        v-for="application of applicationOptions"
        :key="application.value"
        class="flex items-center gap-2"
      >
        <Checkbox
          v-model="studyStore.study.applicationAccess"
          :input-id="application.value"
          :value="application.value"
          :disabled="
            !studyStore.studyIsEditable ||
            isLoading ||
            studyStore.studyIsUpdating
          "
          @change="updateApplicationAccess(application.value)"
        />
        <label :for="application.value" class="cursor-pointer">{{
          application.label
        }}</label>
      </div>
    </div>
  </div>
</template>

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import { useStudyApplications } from '../api/applicationQueries';
  import MultiSelect from 'primevue/multiselect';
  import Button from 'primevue/button';
  import { Study, StudyRole, StudyStatus } from '@gs/models';
  import { useI18n } from 'vue-i18n';

  const props = defineProps<{
    study: Study;
    userRoles: StudyRole[];
  }>();

  const emit = defineEmits<{
    (e: 'onUpdateStudy', study: Study): void;
  }>();

  const { t } = useI18n();
  const { data: availableApplications, isLoading } = useStudyApplications(
    props.study.studyId!,
  );

  const selectedApplications = ref<string[]>([]);

  watch(
    () => props.study.applicationAccess,
    (newVal) => {
      selectedApplications.value = [...(newVal || [])];
    },
    { immediate: true },
  );

  const applicationOptions = computed(() =>
    (availableApplications.value || []).map((val) => ({
      value: val,
      label: t(`study.applications.label.${val}`),
    })),
  );

  function save(): void {
    const updatedStudy = {
      ...props.study,
      applicationAccess: selectedApplications.value,
    };
    emit('onUpdateStudy', updatedStudy);
  }

  function hasAccessToEdit(): boolean {
    const accessEditRoles: StudyRole[] = [
      StudyRole.StudyAdmin,
      StudyRole.StudyOperator,
    ];
    const editableStatuses: StudyStatus[] = [
      StudyStatus.Draft,
      StudyStatus.Paused,
      StudyStatus.PausedPreview,
    ];
    return (
      props.userRoles.some((r) => accessEditRoles.includes(r)) &&
      editableStatuses.includes(props.study.status!)
    );
  }
</script>

<template>
  <div class="study-application-manager mt-10">
    <h3 class="mb-4 text-xl font-bold">{{ t('study.applications.title') }}</h3>
    <div class="flex items-center gap-4">
      <MultiSelect
        v-model="selectedApplications"
        :options="applicationOptions || []"
        option-label="label"
        option-value="value"
        :placeholder="t('study.applications.placeholder')"
        :disabled="!hasAccessToEdit() || isLoading"
        :show-toggle-all="false"
        class="w-full md:w-80"
      />
      <Button
        v-if="hasAccessToEdit()"
        :label="t('global.labels.save')"
        icon="pi pi-check"
        :disabled="isLoading"
        @click="save"
      />
    </div>
  </div>
</template>

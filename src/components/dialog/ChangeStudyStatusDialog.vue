/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { Study, StudyStatus } from '@gs';
  import { useI18n } from 'vue-i18n';
  import StudyStatusPill from '../study/StudyStatusPill.vue';
  import ExclamationIcon from '../shared/ExclamationIcon.vue';

  const { te } = useI18n();
  const dialogRef: any = inject('dialogRef');
  const study: Study = dialogRef.value.data.study;
  const changedStatus: StudyStatus = dialogRef.value.data.changedStatus;

  function setStudyStatus(): void {
    dialogRef.value.close(changedStatus);
  }
  function closeDialog(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div
    v-for="i18nKey in [
      `study.statusChange.transition.${study.status}-${changedStatus}`,
    ]"
    :key="i18nKey"
    class="dialog"
  >
    <div v-if="te(`${i18nKey}.intro`)" class="mb-6">
      {{ $t(`${i18nKey}.intro`) }}
    </div>
    <h3 class="mb-3 font-medium">
      <span class="text-color"> Id {{ study.studyId }}: </span>
      <span class="color-primary">{{ study.title }}</span>
    </h3>
    <h5 class="mb-7 text-lg font-medium">
      {{ $t('study.statusChange.labels.changeFrom') }}
      <StudyStatusPill :status="study.status as StudyStatus" />
      {{ $t('global.labels.to') }}
      <StudyStatusPill :status="changedStatus" />
    </h5>
    <div class="mb-10">
      <h5 class="text-lg font-bold">{{ $t('study.props.purpose') }}</h5>
      <div>{{ study.purpose }}</div>
    </div>
    <div class="mb-8 mt-10 px-14">
      <div
        v-if="te(i18nKey)"
        class="grid grid-cols-12 place-items-center gap-4"
      >
        <div class="col-span-2">
          <ExclamationIcon id="exclamation"/>
        </div>
        <div class="col-span-10">
          <div v-if="te(`${i18nKey}.warning`)" class="mb-2">
            {{ $t(`${i18nKey}.warning`) }}
          </div>
          <div v-if="te(`${i18nKey}.confirm`)" class="font-medium text-red-600">
            {{ $t(`${i18nKey}.confirm`) }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-row items-center justify-end">
      <Button
        type="button"
        class="p-button btn-gray"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />
      <Button
        type="button"
        class="p-button btn-important ml-2"
        :label="$t('study.statusChange.labels.changeStatus')"
        @click="setStudyStatus"
      />
    </div>
  </div>
</template>

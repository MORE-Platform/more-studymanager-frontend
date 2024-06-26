/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { Study, StudyStatus } from '../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import StudyStatusPill from '../study/StudyStatusPill.vue';

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
      <StudyStatusPill :status="study.status!" />
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
          <svg
            id="exclamation"
            class="w-full"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="61.127"
            height="54"
            viewBox="0 0 61.127 54"
          >
            <defs>
              <clipPath id="clip-path">
                <rect
                  id="Rechteck_148158"
                  width="61.127"
                  height="54"
                  fill="none"
                />
              </clipPath>
            </defs>
            <g id="Gruppe_161928" clip-path="url(#clip-path)">
              <path
                id="Pfad_1250"
                d="M60.43,46.37,34.954,2.527a5.08,5.08,0,0,0-8.782,0L.7,46.37A5.077,5.077,0,0,0,5.087,54H56.038a5.077,5.077,0,0,0,4.391-7.63M30.952,47.826H30.92a3.742,3.742,0,1,1,.032,0m3.22-12.659a1.882,1.882,0,0,1-1.886,1.828H29.62a1.886,1.886,0,0,1-1.886-1.828L27.182,17.26v-.046a1.89,1.89,0,0,1,1.886-1.9h3.814a1.891,1.891,0,0,1,1.84,1.942Z"
                transform="translate(0 0.001)"
                fill="#a37070"
              />
            </g>
          </svg>
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

    <div class="flex justify-end">
      <Button
        type="button"
        class="p-button btn-gray !mr-3"
        @click="closeDialog"
      >
        {{ $t('global.labels.close') }}
      </Button>
      <Button
        type="button"
        class="p-button btn-important ml-2"
        @click="setStudyStatus"
      >
        {{ $t('study.statusChange.labels.changeStatus') }}
      </Button>
    </div>
  </div>
</template>

/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Österreichische Vereinigung zur
 * Förderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { Study, StudyStatus } from '../../generated-sources/openapi';

  const dialogRef: any = inject('dialogRef');
  const study: Study = dialogRef.value.data?.study || {};
  const changedStatus: string = dialogRef.value.data?.changedStatus || '';

  function setStudyStatus() {
    dialogRef.value.close(changedStatus);
  }
  function closeDialog() {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog">
    <div class="mb-6">
      <span v-if="changedStatus === StudyStatus.Active">
        {{ $t('study.statusChange.changeMsg.toActive.intro') }}
      </span>
      <span v-else-if="changedStatus === StudyStatus.Paused">
        {{ $t('study.statusChange.changeMsg.toPaused.intro') }}
      </span>
      <span v-else-if="changedStatus === StudyStatus.Closed">
        {{ $t('study.statusChange.changeMsg.toCompleted.intro') }}
      </span>
    </div>
    <h3 class="mb-3 font-medium">
      <span class="text-color"> Id {{ study.studyId }}: </span>
      <span class="color-primary">{{ study.title }}</span>
    </h3>
    <h5 class="mb-7 font-medium">
      {{ $t('study.statusChange.labels.changeTo') }}
      <span
        class="status text-color ml-1 mr-1 rounded p-1 text-center uppercase"
        :class="[
          [study.status == StudyStatus.Active ? 'active text-green-400' : ''],
          [
            study.status === StudyStatus.Paused ||
            study.status === StudyStatus.Draft
              ? 'draft text-gray-400'
              : '',
          ],
        ]"
      >
        {{ $t('study.statusStrings.' + study.status) }}
      </span>
      {{ $t('global.labels.to') }}
      <span
        class="status text-color mr-1 ml-1 rounded p-1 text-center uppercase"
        :class="[
          [changedStatus == StudyStatus.Active ? 'active text-green-400' : ''],
          [
            changedStatus === StudyStatus.Paused ||
            changedStatus === StudyStatus.Draft
              ? 'draft text-gray-400'
              : '',
          ],
        ]"
      >
        {{ $t('study.statusStrings.' + changedStatus) }}
      </span>
    </h5>
    <div class="mb-10">
      <h5 class="font-bold">{{ $t('study.props.purpose') }}</h5>
      <div>{{ study.purpose }}</div>
    </div>
    <div class="mb-8 mt-10 px-14">
      <div class="grid grid-cols-12 place-items-center gap-4">
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
          <div class="mb-2">
            <span v-if="changedStatus === StudyStatus.Active">
              <span v-if="study.status === StudyStatus.Draft">
                {{ $t('study.statusChange.changeMsg.toActive.warning') }}
              </span>
              <span v-else class="active">
                {{ $t('study.statusChange.changeMsg.pausedToActive.warning') }}
              </span>
            </span>
            <span v-else-if="changedStatus === StudyStatus.Paused">
              {{ $t('study.statusChange.changeMsg.toPaused.warning') }}
            </span>
            <span v-else-if="changedStatus === StudyStatus.Closed">
              {{ $t('study.statusChange.changeMsg.toCompleted.warning') }}
            </span>
          </div>
          <div class="font-medium text-red-600">
            <span v-if="changedStatus === StudyStatus.Active">
              <span v-if="study.status === StudyStatus.Draft">
                {{ $t('study.statusChange.changeMsg.toActive.confirm') }}
              </span>
              <span v-else>
                {{ $t('study.statusChange.changeMsg.pausedToActive.confirm') }}
              </span>
            </span>
            <span v-else-if="changedStatus === StudyStatus.Paused">
              {{ $t('study.statusChange.changeMsg.toPaused.confirm') }}
            </span>
            <span v-else-if="changedStatus === StudyStatus.Closed">
              {{ $t('study.statusChange.changeMsg.toCompleted.confirm') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <Button type="button" class="p-button btn-gray mr-3" @click="closeDialog">
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

<style scoped lang="postcss">
  .buttons {
    button {
      margin-left: 10px;
    }
  }
  h5 {
    font-size: 18px;
  }
  .status {
    border: 2px solid var(--text-color);
    &.active {
      border-color: var(--green-400);
    }
    &.draft {
      border-color: var(--gray-400);
    }
  }
  .btn-gray {
    margin-right: 0.5rem;
  }
</style>

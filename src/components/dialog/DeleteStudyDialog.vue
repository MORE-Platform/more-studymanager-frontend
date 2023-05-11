<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { useConfirm } from "primevue/useconfirm";
  import { useStudyStore } from "../../stores/studyStore";
  import {Study} from "../../generated-sources/openapi";
  import {MoreTableAction} from "../../models/MoreTableModel";

  const confirm = useConfirm();
  const studyStore = useStudyStore();

  const infoDialogRef: any = inject('dialogRef');
  const message: number = infoDialogRef?.value?.data?.message;
  const study: Study = infoDialogRef?.value?.data?.study;
  const action: MoreTableAction = infoDialogRef?.value?.data?.action;

  function deleteStudy() {
    studyStore.deleteStudy(study.studyId);
    infoDialogRef.value.close();
  }
  function closeDialog() {
    infoDialogRef.value.close();
  }
</script>

<template>
  <div class="delete-confirm-dialog">
    <div class="mb-6">You are about to delete the following study:</div>
    <h3 class="font-medium mb-4">
      <span class="status text-color rounded p-1 text-center uppercase"
        :class="[
          [study.status == 'active' ? 'active green-400' : ''],
          [study.status === 'paused' || study.status === 'draft' ? 'draft gray-400' : '']]">
        {{ study.status }}
      </span>
      <span class="text-color"> Id {{ study.studyId }}: </span>
      <span class="color-primary">{{ study.title }}</span>
    </h3>
    <div class="mb-8">
      <h5>Purpose</h5>
      <div>{{ study.purpose }}</div>
    </div>
    <div class="px-14">
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-2">
          <svg class="w-full" id="exclamation" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="61.127" height="54" viewBox="0 0 61.127 54">
            <defs>
              <clipPath id="clip-path">
                <rect id="Rechteck_148158" width="61.127" height="54" fill="none"/>
              </clipPath>
            </defs>
            <g id="Gruppe_161928" clip-path="url(#clip-path)">
              <path id="Pfad_1250"  d="M60.43,46.37,34.954,2.527a5.08,5.08,0,0,0-8.782,0L.7,46.37A5.077,5.077,0,0,0,5.087,54H56.038a5.077,5.077,0,0,0,4.391-7.63M30.952,47.826H30.92a3.742,3.742,0,1,1,.032,0m3.22-12.659a1.882,1.882,0,0,1-1.886,1.828H29.62a1.886,1.886,0,0,1-1.886-1.828L27.182,17.26v-.046a1.89,1.89,0,0,1,1.886-1.9h3.814a1.891,1.891,0,0,1,1.84,1.942Z" transform="translate(0 0.001)" fill="#a37070"/>
            </g>
          </svg>
        </div>
        <div class="col-span-10">
          <div>
            {{ message }}
          </div>
          <div class="font-medium text-red-600">Are you sure you want to delete your study? </div>
        </div>
      </div>
    </div>


    <div class="flex justify-end">
      <Button type="button" class="p-button button-gray" @click="closeDialog">
        {{ $t('global.labels.close') }}
      </Button>
      <Button type="button" class="p-button button-red ml-2" @click="deleteStudy">
        {{ $t('global.labels.delete' )}}
      </Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .delete-confirm-dialog {
    font-size: 1rem;
  }
  h5 {
    font-size: 18px;
    font-weight: bold;
  }
  .status {
    border: 2px solid var(--text-color);

    &.green-400 {
      color: var(--green-400);
      border-color: var(--green-400);
    }
    &.gray-400 {
      color: var(--gray-400);
      border-color: var(--gray-400);
    }
  }
  .text-red-600 {
    color: var(--red-600);
  }
  .bg-gray-400 {
    background-color: var(--gray-400);
    border: var(--gray-400);
  }
</style>

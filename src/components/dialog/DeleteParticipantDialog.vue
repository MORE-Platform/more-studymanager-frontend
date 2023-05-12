<script setup lang="ts">
  import { inject } from 'vue';
  import Button from 'primevue/button';
  import { Participant } from '../../generated-sources/openapi';

  const dialogRef: any = inject('dialogRef');
  const introMsg: string = dialogRef?.value?.data?.introMsg;
  const warningMsg: string = dialogRef?.value?.data?.warningMsg;
  const confirmMsg: string = dialogRef?.value?.data?.confirmMsg;
  const participant: Participant = dialogRef?.value?.data?.participant;

  function deleteParticipant(withData: boolean) {
    dialogRef.value.close({ participant, withData });
  }

  function closeDialog() {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog delete-confirm-dialog">
    <div class="mb-6">{{ introMsg }}</div>
    <h3 class="mb-7 font-medium">
      <span class="text-color">Id {{ participant.participantId }}: </span>
      <span class="color-primary"
        >{{ participant.alias }} ( {{ participant.status }} )</span
      >
    </h3>
    <!--<h3 class="font-medium">
      <span class="color-primary">{{ elTitle }}</span>
    </h3>
    <div v-if="elInfoTitle && elInfoDesc" class="mt-5">
      <h5>{{ elInfoTitle }}</h5>
      <div>{{ elInfoDesc }}</div>
    </div>   -->
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
            {{ warningMsg }}
          </div>
          <div class="font-medium text-red-600">{{ confirmMsg }}</div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <Button type="button" class="p-button btn-gray mr-3" @click="closeDialog">
        {{ $t('global.labels.close') }}
      </Button>

      <Button
        type="button"
        class="p-button p-button-danger mr-3"
        @click="deleteParticipant(false)"
      >
        {{ $t('participants.dialog.deleteMsg.deleteWithoutData') }}
      </Button>

      <Button
        type="button"
        class="p-button p-button-danger"
        @click="deleteParticipant(true)"
      >
        {{ $t('participants.dialog.deleteMsg.deleteWithData') }}
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
  .mr-3 {
    margin-right: 0.5rem;
  }
</style>

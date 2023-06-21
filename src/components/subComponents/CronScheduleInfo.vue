<script setup lang="ts">
  import { ref } from 'vue';

  defineProps({
    editable: {
      type: Boolean,
      required: true,
    },
  });

  const isDialogOpen = ref(false);

  function openDialog() {
    isDialogOpen.value = !isDialogOpen.value;
  }
</script>

<template>
  <div class="cron-schedule-info">
    <div class="flex items-center gap-4">
      <div class="mb-4 flex-none">
        <span v-if="editable">{{ $t('cronSchedule.formTitle') }}</span>
        <span v-else>{{ $t('cronSchedule.formTitleDisabled') }}</span>
      </div>
      <div class="relative">
        <div
          class="pi pi-info-circle info-circle hover-circle mb-4 flex-none"
          @click="openDialog"
        ></div>
        <div
          v-if="isDialogOpen"
          class="md-4 info-popup absolute grid w-80 grid-cols-1 gap-4"
        >
          <div>{{ $t('cronSchedule.info.generalInfo') }}</div>
          <div>{{ $t('cronSchedule.info.example') }}</div>
          <div>?...{{ $t('cronSchedule.info.questionMark') }}</div>
          <div>*...{{ $t('cronSchedule.info.asterisk') }}</div>
          <a
            href="https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html"
            target="_blank"
          >
            <i class="pi pi-external-link"></i>
            <span class="pl-2"> {{ $t('cronSchedule.cronScheduleTip') }} </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .info-circle {
    font-weight: bold;
    cursor: pointer;
    transition: ease-in-out all 0.25s;
    color: var(--primary-color);

    &.hover-circle:hover {
      color: var(--primary-color--secondary);
    }
  }

  .info-popup {
    left: 50%;
    transform: translateX(-50%);
    top: 16px;
    background-color: white;
    transition: ease-in-out all 0.25s;
    font-size: var(--default-font-size);
    box-shadow: 0 4px 4px -1px rgb(0 0 0 / 0.2);
    border-radius: 0.25rem;
    padding: 8px 12px 8px;
    z-index: 1;
    border: 1px solid lightgray;
  }
</style>

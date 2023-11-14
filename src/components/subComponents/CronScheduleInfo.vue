<script setup lang="ts">
  import { ref } from 'vue';

  defineProps({
    editable: {
      type: Boolean,
      default: false,
    },
  });

  const isDialogOpen = ref(false);

  function openDialog() {
    isDialogOpen.value = !isDialogOpen.value;
  }
</script>

<template>
  <div class="cron-schedule-info mb-3">
    <div class="gap-2">
      <h6 class="mb-2 font-bold">{{ $t('cronSchedule.singular') }}</h6>
      <div class="inline">
        <span v-if="editable">
          <!-- eslint-disable vue/no-v-html -->
          <span v-html="$t('cronSchedule.formTitle')" />
          <!-- eslint-disable vue/no-v-html -->
          <span v-html="$t('cronSchedule.quickStart')" />
        </span>

        <span v-else>{{ $t('cronSchedule.formTitleDisabled') }}</span>
      </div>

      <div class="relative ml-2 inline">
        <div
          class="pi pi-info-circle info-circle hover-circle mb-2"
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
      <div class="cron-rel-warning flex items-center gap-5 px-6 py-4 italic">
        <div>
          <span class="pi pi-exclamation-triangle warning-icon error" />
        </div>
        {{ $t('scheduler.dialog.relativeSchedule.interventionWarning') }}
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
    font-size: var(--default-font-size);
    box-shadow: 0 4px 4px -1px rgb(0 0 0 / 0.2);
    border-radius: 0.25rem;
    padding: 8px 12px 8px;
    z-index: 1;
    border: 1px solid lightgray;
    transition: ease-in-out opacity 0.35s;
    margin-top: 6px;

    &-container {
      &:hover,
      &:active,
      &:focus {
        .info-popup-note {
          opacity: 1;
          cursor-events: all;
        }
      }
    }

    &.info-popup-note {
      transition: ease-in-out opacity 0.35s;
      opacity: 0;
    }
  }

  .cron-rel-warning {
    border: 1px solid var(--surface-50);
    border-radius: 6px;
    background-color: var(--surface-50);
  }
  .warning-icon {
    font-size: 30px;
  }
</style>

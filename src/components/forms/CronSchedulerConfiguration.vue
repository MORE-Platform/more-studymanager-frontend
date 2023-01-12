<script setup lang="ts">
  import { ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';

  const seconds: Ref<number | string> = ref('');
  const minutes: Ref<number | string> = ref('');
  const hours: Ref<number | string> = ref('');
  const months: Ref<number | string> = ref('');
  const dayOfMonth: Ref<number | string> = ref('');
  const dayOfWeek: Ref<number | string> = ref('');

  const isDialogOpen = ref(false);

  function openDialog() {
    isDialogOpen.value = !isDialogOpen.value;
  }
</script>

<template>
  <div>
    <div class="flex items-center gap-4">
      <div class="mb-4 flex-none">{{ $t('cronSchedule.formTitle') }}:</div>
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
            href="http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html"
          >
            <i class="pi pi-external-link"></i>
            <span> Further info on cron values </span>
          </a>
        </div>
      </div>
    </div>
    <form class="grid grid-cols-6 grid-rows-2 items-center gap-4">
      <div class="col-span-1 row-span-2">
        <label for="seconds"
          >{{ $t('cronSchedule.labels.seconds') }}
          <InputText
            v-model="seconds"
            type="text"
            required
            class="w-full"
            :placeholder="$t('cronSchedule.placeholders.secondsAndMinutes')"
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="minutes"
          >{{ $t('cronSchedule.labels.minutes') }}
          <InputText
            v-model="minutes"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.secondsAndMinutes')"
            :auto-resize="true"
            class="w-full"
            required
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="hours"
          >{{ $t('cronSchedule.labels.hours') }}
          <InputText
            v-model="hours"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.hours')"
            :auto-resize="true"
            class="w-full"
            required
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="dayOfMonth"
          >{{ $t('cronSchedule.labels.dayOfMonth') }}
          <InputText
            v-model="dayOfMonth"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.dayOfMonth')"
            :auto-resize="true"
            class="w-full"
            required
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="months"
          >{{ $t('cronSchedule.labels.months') }}
          <InputText
            v-model="months"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.months')"
            :auto-resize="true"
            class="w-full"
            required
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="dayOfWeek"
          >{{ $t('cronSchedule.labels.dayOfWeek') }}
          <InputText
            v-model="dayOfWeek"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.dayOfWeek')"
            :auto-resize="true"
            class="w-full"
            required
          ></InputText>
        </label>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
  .info-circle {
    font-weight: bold;
    cursor: pointer;
    transition: ease-in-out all 0.25s;
    color: var(--primary-color);

    &.hover-circle:hover {
      color: #1f2d40ff;
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
  }
</style>

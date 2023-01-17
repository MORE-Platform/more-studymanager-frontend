<script setup lang="ts">
  import { ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import { TriggerSchedule } from '../../models/CronSchedulerModel';
  import cron from 'cron-validate';

  const props = defineProps({
    triggerSchedule: {
      type: String,
      default: '* * * * * *',
    },
  });

  const triggerSchedule: Ref<TriggerSchedule> = ref({
    seconds: '',
    minutes: '',
    hours: '',
    dayOfMonth: '',
    months: '',
    dayOfWeek: '',
  });

  parseCronScheduleToString();

  // TODO parse schedule string to object

  const emit = defineEmits<{
    (e: 'onValidSchedule', triggerSchedule: string): string;
    (e: 'onCronError', errorMessage: string[]): string[];
  }>();

  function validate() {
    // TODO parse trigger schedule back to string
    // TODO validate
    const parsedTriggerSchedule =
      triggerSchedule.value.minutes +
      ' ' +
      triggerSchedule.value.hours +
      ' ' +
      triggerSchedule.value.dayOfMonth +
      ' ' +
      triggerSchedule.value.months +
      ' ' +
      triggerSchedule.value.dayOfWeek;
    const validCronValue = cron(parsedTriggerSchedule);
    if (validCronValue.isValid()) {
      emit('onValidSchedule', parsedTriggerSchedule);
    } else {
      console.log(validCronValue.getError());
      emit('onCronError', validCronValue.getError());
    }
  }

  function parseCronScheduleToString() {
    // TODO error on mistake in seconds
    const cronStringWithoutSeconds = props.triggerSchedule?.substring(
      0,
      props.triggerSchedule?.length - 1
    );
    console.log(cron(cronStringWithoutSeconds));
    const cronValue = cron(cronStringWithoutSeconds).getValue();
    const minutes =
      typeof cronValue.minutes === 'string'
        ? cronValue.minutes
        : cronValue.minutes?.lowerLimit + '-' + cronValue.minutes?.upperLimit;
    const hours =
      typeof cronValue.hours === 'string'
        ? cronValue.hours
        : cronValue.hours?.lowerLimit + '-' + cronValue.hours?.upperLimit;
    const dayOfMonth =
      typeof cronValue.daysOfMonth === 'string'
        ? cronValue.daysOfMonth
        : cronValue.daysOfMonth?.lowerLimit +
          '-' +
          cronValue.daysOfMonth?.upperLimit;
    const month =
      typeof cronValue.months === 'string'
        ? cronValue.months
        : cronValue.months?.lowerLimit + '-' + cronValue.months?.upperLimit;
    const dayOfWeek =
      typeof cronValue.daysOfWeek === 'string'
        ? cronValue.daysOfWeek
        : cronValue.daysOfWeek?.lowerLimit +
          '-' +
          cronValue.daysOfWeek?.upperLimit;

    triggerSchedule.value = {
      seconds: '?',
      minutes,
      hours,
      dayOfMonth,
      months: month,
      dayOfWeek,
    };
  }

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
            v-model="triggerSchedule.seconds"
            type="text"
            required
            class="w-full"
            :placeholder="$t('cronSchedule.placeholders.secondsAndMinutes')"
            @change="validate"
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="minutes"
          >{{ $t('cronSchedule.labels.minutes') }}
          <InputText
            v-model="triggerSchedule.minutes"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.secondsAndMinutes')"
            :auto-resize="true"
            class="w-full"
            required
            @change="validate"
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="hours"
          >{{ $t('cronSchedule.labels.hours') }}
          <InputText
            v-model="triggerSchedule.hours"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.hours')"
            :auto-resize="true"
            class="w-full"
            required
            @change="validate"
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="dayOfMonth"
          >{{ $t('cronSchedule.labels.dayOfMonth') }}
          <InputText
            v-model="triggerSchedule.dayOfMonth"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.dayOfMonth')"
            :auto-resize="true"
            class="w-full"
            required
            @change="validate"
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="months"
          >{{ $t('cronSchedule.labels.months') }}
          <InputText
            v-model="triggerSchedule.months"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.months')"
            :auto-resize="true"
            class="w-full"
            required
            @change="validate"
          ></InputText>
        </label>
      </div>
      <div class="col-span-1 row-span-2">
        <label for="dayOfWeek"
          >{{ $t('cronSchedule.labels.dayOfWeek') }}
          <InputText
            v-model="triggerSchedule.dayOfWeek"
            type="text"
            :placeholder="$t('cronSchedule.placeholders.dayOfWeek')"
            :auto-resize="true"
            class="w-full"
            required
            @change="validate"
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

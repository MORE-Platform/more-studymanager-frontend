/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { reactive, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import { CronScheduleChoice } from '../../models/CronSchedulerModel';
  import cron from 'cron-validate';
  import { registerOptionPreset } from 'cron-validate/lib/option';
  import { useI18n } from 'vue-i18n';
  import CronScheduleInfo from '../subComponents/CronScheduleInfo.vue';
  import CronScheduleExamples from '../subComponents/CronScheduleExamples.vue';

  const { t } = useI18n();

  const props = defineProps({
    cronSchedule: {
      type: String,
      default: '0 0 12 * * ?',
    },
    editable: {
      type: Boolean,
      default: false,
    },
  });

  registerOptionPreset('default-preset', {
    presetId: 'default-preset',
    daysOfMonth: {
      minValue: 1,
      maxValue: 31,
    },
    daysOfWeek: {
      minValue: 1,
      maxValue: 7,
    },
    hours: {
      minValue: 0,
      maxValue: 23,
    },
    minutes: {
      minValue: 0,
      maxValue: 59,
    },
    months: {
      minValue: 1,
      maxValue: 12,
    },
    seconds: {
      minValue: 0,
      maxValue: 59,
    },
    useSeconds: false,
    useYears: false,
    years: {
      minValue: 1,
      maxValue: 31,
    },
    useBlankDay: true,
    allowOnlyOneBlankDayField: true,
    mustHaveBlankDayField: true,
  });

  const cronArray = props.cronSchedule?.split(' ');
  let returnCronScheduleString: string = props.cronSchedule;

  const tempCronSchedule: Ref<CronScheduleChoice[]> = ref([
    {
      label: t('cronSchedule.labels.minutes'),
      value: cronArray[1],
      placeholder: t('cronSchedule.placeholders.secondsAndMinutes'),
    },
    {
      label: t('cronSchedule.labels.hours'),
      value: cronArray[2],
      placeholder: t('cronSchedule.placeholders.hours'),
    },
    {
      label: t('cronSchedule.labels.dayOfMonth'),
      value: cronArray[3],
      placeholder: t('cronSchedule.placeholders.dayOfMonth'),
    },
    {
      label: t('cronSchedule.labels.months'),
      value: cronArray[4],
      placeholder: t('cronSchedule.placeholders.months'),
    },
    {
      label: t('cronSchedule.labels.dayOfWeek'),
      value: cronArray[5],
      placeholder: t('cronSchedule.placeholders.dayOfWeek'),
    },
  ]);

  const cronError = reactive({
    message: '',
    hasError: false,
  });
  function setCronError(message: string): void {
    cronError.message = message;
    cronError.hasError = true;
  }
  function clearCronError(): void {
    cronError.message = '';
    cronError.hasError = false;
  }

  const emit = defineEmits<{
    (e: 'onValidSchedule', cronScheduleString: string): string;
    (e: 'onError', errorMessage?: string): string;
  }>();

  function validate(): void {
    let parsedTriggerSchedule = '';

    tempCronSchedule.value.forEach((item, index) => {
      parsedTriggerSchedule += item.value;
      if (index < tempCronSchedule.value.length - 1) {
        parsedTriggerSchedule += ' ';
      }
    });
    parsedTriggerSchedule.split(' ').forEach((item, index) => {
      tempCronSchedule.value[index].value = item;
    });
    const validCronValue = cron(parsedTriggerSchedule, {
      preset: 'default-preset',
    });
    if (validCronValue.isValid()) {
      returnCronScheduleString = `0 ${parsedTriggerSchedule}`;
      clearCronError();
      emit('onError', undefined);
      emit('onValidSchedule', returnCronScheduleString);
    } else {
      let error = validCronValue.getError().pop();
      error = error?.split('.')[0].split('(')[0];
      if (error && error[error.length - 1] === ' ') {
        error = error.substring(0, error.length - 1);
      }

      if (error) {
        setCronError(t(`cronSchedule.error.${error}`));
        emit('onError', t(`cronSchedule.error.${error}`));
      }
    }
  }
</script>

<template>
  <div class="cron-schedule-config" :class="{ 'schedule-disabled': !editable }">
    <CronScheduleInfo :editable="editable" />
    <form
      class="mb-4 grid grid-cols-3 grid-rows-2 items-center gap-4 p-2.5 lg:grid-cols-5"
    >
      <div
        v-for="(item, index) in tempCronSchedule"
        :key="index"
        class="col-span-1 row-span-2"
      >
        <label for="item.label">
          <span class="mb-1 font-medium">{{ item.label }}</span>
          <InputText
            v-model="tempCronSchedule[index].value"
            type="text"
            :placeholder="item.placeholder"
            :auto-resize="true"
            class="w-full"
            required
            :disabled="!editable"
            @change="validate"
          />
        </label>
      </div>
    </form>
    <div v-show="cronError.hasError && editable" class="error mb-4">
      {{ cronError.message }}
    </div>
    <CronScheduleExamples />
  </div>
</template>

<style scoped lang="postcss">
  .error {
    color: #d57575;
  }

  .cron-schedule-config.schedule-disabled {
    form {
      border: 1px solid var(--gray-200);
    }
  }
</style>

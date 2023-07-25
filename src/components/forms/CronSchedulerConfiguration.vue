<script setup lang="ts">
  import { ref, Ref } from 'vue';
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
    allowOnlyOneBlankDayField: false,
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
  });

  const cronArray = props.cronSchedule?.split(' ');
  const returnCronSchdeuleString: Ref<string> = ref(props.cronSchedule);

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

  const cronError: Ref<string> = ref('');
  const hasCronError: Ref<boolean> = ref(false);

  const emit = defineEmits<{
    (e: 'onValidSchedule', cronScheduleString: string): string;
    (e: 'onError', errorMessage?: string): string;
  }>();

  function validate() {
    const parsedTriggerSchedule: Ref<string> = ref('');

    tempCronSchedule.value.forEach((item, index) => {
      parsedTriggerSchedule.value = parsedTriggerSchedule.value + item.value;
      if (index < tempCronSchedule.value.length - 1) {
        parsedTriggerSchedule.value = parsedTriggerSchedule.value + ' ';
      }
    });
    parsedTriggerSchedule.value.split(' ').forEach((item, index) => {
      tempCronSchedule.value[index].value = item;
    });
    const validCronValue = cron(parsedTriggerSchedule.value, {
      preset: 'default-preset',
    });
    if (validCronValue.isValid()) {
      returnCronSchdeuleString.value = '0 ' + parsedTriggerSchedule.value;
      cronError.value = '';
      hasCronError.value = false;
      emit('onError', undefined);
      emit('onValidSchedule', returnCronSchdeuleString.value);
    } else {
      hasCronError.value = true;
      const error = validCronValue.getError().pop();
      if (error) {
        cronError.value = error;
        emit('onError', error);
      }
    }
  }
</script>

<template>
  <div
    class="cron-schedule-config"
    :class="editable ? '' : 'schedule-disabled'"
  >
    <CronScheduleInfo :editable="editable" />

    <form
      class="mb-4 grid grid-cols-3 grid-rows-2 items-center gap-4 lg:grid-cols-5"
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
    <div v-show="hasCronError && editable" class="error">
      {{ cronError }}
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
      padding: 10px;
    }
  }
</style>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Frequency, RecurrenceRule } from '../../generated-sources/openapi';
  import { PropType, ref, Ref, watch } from 'vue';
  import Checkbox from 'primevue/checkbox';
  import InputNumber from 'primevue/inputnumber';
  import SelectButton from 'primevue/selectbutton';
  import { useStudyStore } from '../../stores/studyStore';
  import { MoreTableChoice } from '../../models/MoreTableModel';

  const studyStore = useStudyStore();
  const { t } = useI18n();

  const props = defineProps({
    schedulerRrule: {
      type: Object as PropType<RecurrenceRule>,
      default: undefined,
    },
    rruleChecked: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits<{
    (e: 'onRruleChange', schedulerRrule: RecurrenceRule): void;
    (e: 'onRruleError', error: MoreTableChoice[]): void;
    (e: 'onRruleCheckboxChange', rruleChecked: boolean): void;
  }>();

  const returnRrule: Ref<RecurrenceRule> = ref({
    freq: props.schedulerRrule?.freq,
    until: props.schedulerRrule?.until,
    count: props.schedulerRrule?.count,
    interval: props.schedulerRrule?.interval,
    byday: props.schedulerRrule?.byday,
    bymonth: props.schedulerRrule?.bymonth,
    bymonthDay: props.schedulerRrule?.bymonthday,
    bysetpos: props.schedulerRrule?.bysetpos,
  });

  const previewCount: Ref<number | undefined> = ref(
    returnRrule.value.count && returnRrule.value.byday?.length
      ? returnRrule.value.count / returnRrule.value.byday.length
      : returnRrule.value.count
      ? returnRrule.value.count
      : undefined
  );

  const rruleEventCheckbox: Ref<boolean> = ref(props.rruleChecked);
  emit('onRruleCheckboxChange', rruleEventCheckbox.value);

  const rruleErrors: Ref<Array<MoreTableChoice>> = ref([]);

  function checkErrors() {
    rruleErrors.value = [];
    if (rruleEventCheckbox.value) {
      if (typeof returnRrule.value.freq === 'undefined') {
        rruleErrors.value.push({
          label: 'freqIsEmpty',
          value: t('scheduler.warningsAndErrors.rruleFreqIsEmpty'),
        });
      }
      if (
        returnRrule.value.freq === Frequency.Weekly &&
        !returnRrule.value.byday?.length
      ) {
        rruleErrors.value.push({
          label: 'rruleWeeklyIsMissingByDay',
          value: t('scheduler.warningsAndErrors.rruleWeeklyIsMissingByDay'),
        });
      }
      if (
        typeof returnRrule.value.until !== 'string' &&
        typeof previewCount.value !== 'number'
      ) {
        rruleErrors.value.push({
          label: 'rruleEndIsEmpty',
          value: t('scheduler.warningsAndErrors.rruleEndIsEmpty'),
        });
      }
    }

    emit('onRruleError', rruleErrors.value);
  }

  function getError(label: string): string | null | undefined {
    const item = rruleErrors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
  }

  const rruleEndOptions = [
    {
      label: t('scheduler.labels.event.repetitionEnd.studyEnd'),
      value: 'onDate',
      unit: 'onDate',
    },
    {
      label: t('scheduler.labels.event.repetitionEnd.after'),
      value: 'after',
      unit: 'after',
    },
  ];

  const rruleFrequencyOptions = [
    {
      label: t('scheduler.frequency.labels.daily'),
      value: Frequency.Daily,
      active: true,
      unit: t('scheduler.frequency.days'),
    },
    {
      label: t('scheduler.frequency.labels.weekly'),
      value: Frequency.Weekly,
      active: true,
      unit: t('scheduler.frequency.weeks'),
    },
  ];

  const rruleWeekdayOptions = [
    {
      label: t('scheduler.weekday.short.monday'),
      value: t('scheduler.weekday.short.monday'),
    },
    {
      label: t('scheduler.weekday.short.tuesday'),
      value: t('scheduler.weekday.short.tuesday'),
    },
    {
      label: t('scheduler.weekday.short.wednesday'),
      value: t('scheduler.weekday.short.wednesday'),
    },
    {
      label: t('scheduler.weekday.short.thursday'),
      value: t('scheduler.weekday.short.thursday'),
    },
    {
      label: t('scheduler.weekday.short.friday'),
      value: t('scheduler.weekday.short.friday'),
    },
    {
      label: t('scheduler.weekday.short.saturday'),
      value: t('scheduler.weekday.short.saturday'),
    },
    {
      label: t('scheduler.weekday.short.sunday'),
      value: t('scheduler.weekday.short.sunday'),
    },
  ];

  const rruleCountLabel: Ref<string | undefined> = ref(
    returnRrule.value && returnRrule.value.freq
      ? rruleFrequencyOptions.find(
          (f: any) => f.value === returnRrule.value.freq
        )?.unit
      : ''
  );

  const rruleEndOptionValue: Ref<string> = ref('never');

  if (typeof returnRrule.value.count === 'number') {
    rruleEndOptionValue.value = 'after';
  } else if (typeof returnRrule.value.until === 'string') {
    rruleEndOptionValue.value = 'onDate';
  }

  function setRruleCountLabel(rruleFreq: string | undefined) {
    if (rruleFreq) {
      rruleCountLabel.value = rruleFrequencyOptions.find(
        (f: any) => f.value === rruleFreq
      )?.unit;
    }
  }

  function toggleRruleCheckbox() {
    checkErrors();
    emit('onRruleCheckboxChange', rruleEventCheckbox.value);
  }

  function setRepetitionEnd(type: string | undefined) {
    switch (type) {
      case 'onDate':
        {
          returnRrule.value.count = undefined;
          previewCount.value = undefined;

          const endDate = new Date(studyStore.study.plannedEnd as string);
          endDate.setHours(0, 0, 0);
          returnRrule.value.until = endDate.toISOString();
        }
        break;
      case 'after':
        {
          returnRrule.value.until = undefined;
          if (returnRrule.value.freq === Frequency.Daily) {
            returnRrule.value.byday = undefined;
          }
        }
        break;
      case 'never': {
        returnRrule.value.count = undefined;
        previewCount.value = undefined;
        returnRrule.value.until = undefined;
        returnRrule.value.byday = undefined;
      }
    }
    onChangeRrule();
  }

  watch(previewCount, () => {
    if (previewCount.value && rruleEndOptionValue.value === 'after') {
      if (returnRrule.value.byday?.length) {
        returnRrule.value.count =
          previewCount.value * returnRrule.value.byday.length;
      } else {
        returnRrule.value.count = previewCount.value;
      }
    }
  });

  function onChangeRrule(type?: string) {
    if (
      type === 'byday' &&
      previewCount.value &&
      returnRrule.value.byday?.length
    ) {
      returnRrule.value.count =
        previewCount.value * returnRrule.value.byday.length;
    }

    if (!rruleErrors.value.length) {
      emit('onRruleChange', returnRrule.value);
    }

    if (type === 'count' && !previewCount.value) {
      returnRrule.value.count = undefined;
    }

    if (returnRrule.value.freq === Frequency.Daily && returnRrule.value.byday) {
      returnRrule.value.byday = undefined;
    }

    checkErrors();
    emit('onRruleError', rruleErrors.value);
    emit('onRruleChange', returnRrule.value);
  }
</script>

<template>
  <div class="absolute-scheduler-rrule">
    <div class="col-span-6 col-start-1 grid grid-cols-6 gap-4">
      <hr class="col-start-0 col-span-6 mb-4 mt-4" />
      <h6 class="col-span-6">{{ $t('scheduler.labels.event.repeat') }}</h6>
      <div class="col-span-6 mb-2">
        {{ $t('scheduler.labels.event.repeatDesc') }}
      </div>
      <div class="col-span-6 mt-4 grid grid-cols-6 items-center gap-4">
        <div class="col-span-1">
          {{ $t('scheduler.labels.repeat') }}:
          <Checkbox
            v-model="rruleEventCheckbox"
            class="ml-2"
            :binary="true"
            @change="toggleRruleCheckbox()"
          />
        </div>

        <div
          v-if="rruleEventCheckbox"
          class="col-span-5 col-start-2 grid grid-cols-5 gap-4"
        >
          <!-- choose daily or weekly repeat option -->
          <SelectButton
            v-model="returnRrule.freq"
            :options="rruleFrequencyOptions"
            option-label="label"
            option-value="value"
            class="col-span-5 w-full"
            @click="setRruleCountLabel(returnRrule.freq)"
            @change="onChangeRrule()"
          />
        </div>
        <div
          v-if="getError('freqIsEmpty')"
          class="error col-span-5 col-start-2 mb-4"
        >
          {{ getError('freqIsEmpty') }}
        </div>

        <!-- frequency: weekly repeat option (Mo to Su) -->
        <div
          v-if="rruleEventCheckbox && returnRrule.freq === Frequency.Weekly"
          class="col-span-6 grid grid-cols-6"
        >
          <SelectButton
            v-model="returnRrule.byday"
            :options="rruleWeekdayOptions"
            option-label="label"
            option-value="value"
            class="col-span-5 col-start-2 w-full"
            :multiple="true"
            @change="onChangeRrule('byday')"
          />
          <div
            v-if="getError('rruleWeeklyIsMissingByDay')"
            class="error col-span-5 col-start-2 mb-4"
          >
            {{ getError('rruleWeeklyIsMissingByDay') }}
          </div>
          <hr class="col-start-0 col-span-6 mb-4 mt-4" />
        </div>

        <!-- repetition ending options -->
        <div
          v-if="rruleEventCheckbox && returnRrule.freq"
          class="col-span-6 grid grid-cols-6"
        >
          <div class="col-span-1 self-center font-medium">
            {{ $t('scheduler.labels.repetitionEnd') }}
          </div>
          <div class="col-span-5">
            <SelectButton
              v-model="rruleEndOptionValue"
              :options="rruleEndOptions"
              option-label="label"
              option-value="value"
              class="mr-4 inline w-full"
              @change="setRepetitionEnd($event.value)"
            />
            <!-- selected repeat end option: after -->
            <div
              v-if="rruleEndOptionValue === 'after'"
              class="col-span-5 col-start-2 inline gap-4"
            >
              <InputNumber
                v-model="previewCount"
                :placeholder="$t('scheduler.placeholder.enterRepeatCount')"
                @input="onChangeRrule('count')"
                @blur="onChangeRrule('count')"
              />
              <span class="ml-2">{{ rruleCountLabel }}</span>
            </div>
          </div>
          <div
            v-if="getError('rruleEndIsEmpty')"
            class="error col-span-5 col-start-2 mb-4"
          >
            {{ getError('rruleEndIsEmpty') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

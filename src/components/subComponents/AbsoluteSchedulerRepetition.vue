<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { Frequency, RecurrenceRule } from '@gs';
  import { PropType, reactive, ref, Ref, watch } from 'vue';
  import Checkbox from 'primevue/checkbox';
  import InputNumber from 'primevue/inputnumber';
  import SelectButton from 'primevue/selectbutton';
  import { MoreTableChoice } from '../../models/MoreTableModel';

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

  enum RRuleEndOptions {
    never = 'never',
    after = 'after',
  }

  const returnRrule: RecurrenceRule = reactive({
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
    returnRrule.count && returnRrule.byday?.length
      ? returnRrule.count / returnRrule.byday.length
      : (returnRrule.count ?? undefined),
  );

  const rruleEventCheckbox: Ref<boolean> = ref(props.rruleChecked);
  emit('onRruleCheckboxChange', rruleEventCheckbox.value);

  let rruleErrors: MoreTableChoice[] = [];

  function checkErrors(): void {
    rruleErrors = [];
    if (rruleEventCheckbox.value) {
      if (typeof returnRrule.freq === 'undefined') {
        rruleErrors.push({
          label: 'freqIsEmpty',
          value: t('scheduler.warningsAndErrors.rruleFreqIsEmpty'),
        });
      }
      if (returnRrule.freq === Frequency.Weekly && !returnRrule.byday?.length) {
        rruleErrors.push({
          label: 'rruleWeeklyIsMissingByDay',
          value: t('scheduler.warningsAndErrors.rruleWeeklyIsMissingByDay'),
        });
      }
      if (
        rruleEndOptionValue.value === RRuleEndOptions.after &&
        typeof previewCount.value !== 'number'
      ) {
        rruleErrors.push({
          label: 'rruleEndIsEmpty',
          value: t('scheduler.warningsAndErrors.rruleEndIsEmpty'),
        });
      }
    }

    emit('onRruleError', rruleErrors);
  }

  function getError(label: string): string | null | undefined {
    const item = rruleErrors.find((el) => (el.label === label ? el.value : ''));
    return item?.value;
  }

  const rruleEndOptions = [
    {
      label: t('scheduler.labels.event.repetitionEnd.studyEnd'),
      value: RRuleEndOptions.never,
      unit: RRuleEndOptions.never,
    },
    {
      label: t('scheduler.labels.event.repetitionEnd.after'),
      value: RRuleEndOptions.after,
      unit: RRuleEndOptions.after,
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
    returnRrule && returnRrule.freq
      ? rruleFrequencyOptions.find((f: any) => f.value === returnRrule.freq)
          ?.unit
      : '',
  );

  const rruleEndOptionValue: Ref<string> = ref(RRuleEndOptions.never);

  if (typeof returnRrule.count === 'number') {
    rruleEndOptionValue.value = RRuleEndOptions.after;
  }

  function setRruleCountLabel(rruleFreq: string | undefined): void {
    if (rruleFreq) {
      rruleCountLabel.value = rruleFrequencyOptions.find(
        (f: any) => f.value === rruleFreq,
      )?.unit;
    }
  }

  function toggleRruleCheckbox(): void {
    checkErrors();
    emit('onRruleCheckboxChange', rruleEventCheckbox.value);
  }

  function setRepetitionEnd(type: string | undefined): void {
    switch (type) {
      case RRuleEndOptions.after:
        {
          returnRrule.until = undefined;
          if (returnRrule.freq === Frequency.Daily) {
            returnRrule.byday = undefined;
          }
        }
        break;
      case RRuleEndOptions.never: {
        returnRrule.count = undefined;
        previewCount.value = undefined;
        returnRrule.until = undefined;
        returnRrule.byday = undefined;
      }
    }
    onChangeRrule();
  }

  watch(previewCount, () => {
    if (
      previewCount.value &&
      rruleEndOptionValue.value === RRuleEndOptions.after
    ) {
      if (returnRrule.byday?.length) {
        returnRrule.count = previewCount.value * returnRrule.byday.length;
      } else {
        returnRrule.count = previewCount.value;
      }
    }
  });

  function onChangeRrule(type?: string, eventValue?: any): void {
    if (type === 'byday' && previewCount.value && returnRrule.byday?.length) {
      returnRrule.count = previewCount.value * returnRrule.byday.length;
    }

    if (!rruleErrors.length) {
      emit('onRruleChange', returnRrule);
    }

    if (type === 'count') {
      previewCount.value = eventValue;
      if (!previewCount.value) {
        returnRrule.count = undefined;
      }
    }

    if (returnRrule.freq === Frequency.Daily && returnRrule.byday) {
      returnRrule.byday = undefined;
    }

    checkErrors();
    emit('onRruleError', rruleErrors);
    emit('onRruleChange', returnRrule);
  }
</script>

<template>
  <div class="absolute-scheduler-rrule">
    <div class="col-span-6 col-start-1 grid grid-cols-6 gap-4">
      <hr class="col-start-0 col-span-6 my-4" />
      <h6 class="col-span-6">{{ $t('scheduler.labels.event.repeat') }}</h6>
      <div class="col-span-6 mb-2">
        {{ $t('scheduler.labels.event.repeatDesc') }}
      </div>
      <div class="col-span-6 mt-4 grid grid-cols-6 items-center gap-4">
        <div class="flex-row- flex items-center justify-start">
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
          <hr class="col-start-0 col-span-6 my-4" />
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
              v-if="rruleEndOptionValue === RRuleEndOptions.after"
              class="col-span-5 col-start-2 inline gap-4"
            >
              <InputNumber
                v-model="previewCount"
                :placeholder="$t('scheduler.placeholder.enterRepeatCount')"
                @input="onChangeRrule('count', $event.value)"
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

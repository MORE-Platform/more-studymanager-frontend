<script setup lang="ts">
  import { computed, inject, ref, Ref, watch } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import Checkbox from 'primevue/checkbox';
  import { Duration, UnitEnum, RelativeEvent } from '@gs';
  import { useI18n } from 'vue-i18n';
  import { ScheduleType } from '../../models/Scheduler';
  import { DateTime } from 'luxon';
  import { createLuxonDateTime, timeFromString } from '../../utils/dateUtils';
  import { useStudyStore } from '../../stores/studyStore';
  import { storeToRefs } from 'pinia';
  import {
    correctEvent,
    correctEventRepetition,
  } from '../../utils/relativeScheduleUtils';
  import { calcStudyDurationFromStudy } from '../../utils/studyUtils';
  import ErrorLabel from '../forms/ErrorLabel.vue';
  import { useErrorQueue } from '../../composable/useErrorHandling';
  import { valueToMinutes } from '../../utils/durationUtils';
  import { scrollToFirstError } from '../../utils/componentUtils';
  import { ONE_DAY_IN_MINUTES } from '../../constants';
  import RandomizationView from '../subComponents/RandomizationView.vue';
  import { useToast } from 'primevue/usetoast';

  const timeFormat = 'HH:mm:ss';
  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');
  const toast = useToast();
  const studyStore = useStudyStore();
  const { study } = storeToRefs(studyStore);
  const maxDuration = computed((): Duration | undefined =>
    calcStudyDurationFromStudy(study.value),
  );

  const schedule: RelativeEvent = dialogRef.value.data.scheduler;

  const startOffset = ref<Duration>({
    value: schedule.dtstart?.offset?.value ?? 1,
    unit: UnitEnum.Day,
  });
  const startTime = ref<DateTime>(
    DateTime.now().set({ hour: 10, minute: 30, second: 0 }),
  );

  const endOffset = ref<Duration>({
    value: schedule.dtend?.offset?.value ?? 1,
    unit: UnitEnum.Day,
  });
  const endTime = ref<DateTime>(
    DateTime.now().set({ hour: 18, minute: 30, second: 0 }),
  );

  if (schedule.dtstart?.time) {
    const time = timeFromString(schedule.dtstart.time);
    if (time) {
      startTime.value = startTime.value.set(time);
    }
  }
  if (schedule.dtend?.time) {
    const time = timeFromString(schedule.dtend.time);
    if (time) {
      endTime.value = endTime.value.set(time);
    }
  }

  const returnSchedule: Ref<RelativeEvent> = ref({
    type: ScheduleType.RelativeEvent,
    dtstart: {
      offset: {
        value: schedule.dtstart?.offset?.value,
        unit: schedule.dtstart?.offset?.unit,
      },
      time: schedule.dtstart?.time ?? startTime.value.toFormat('HH:mm'),
      timezone: schedule.dtstart?.timezone,
    },
    dtend: {
      offset: {
        value: schedule.dtend?.offset?.value,
        unit: schedule.dtend?.offset?.unit,
      },
      time: schedule.dtend?.time ?? endTime.value.toFormat('HH:mm'),
      timezone: schedule.dtend?.timezone,
    },
    rrrule: {
      frequency: {
        value: schedule.rrrule?.frequency?.value,
        unit: schedule.rrrule?.frequency?.unit,
      },
      endAfter: {
        value: schedule.rrrule?.endAfter?.value,
        unit: schedule.rrrule?.endAfter?.unit,
      },
    },
    random: schedule.random ?? { state: false, duration: 0 },
  });

  const frequency = ref<number>(schedule.rrrule?.frequency?.value || 1);
  const frequencyUnit = ref<UnitEnum>(
    schedule.rrrule?.frequency?.unit ?? UnitEnum.Day,
  );

  const endRep = ref<number>(schedule.rrrule?.endAfter?.value || 4);
  const endRepUnit = ref<UnitEnum>(
    schedule.rrrule?.endAfter?.unit ?? UnitEnum.Day,
  );

  const repeatChecked: Ref<boolean> = ref(!!schedule.rrrule?.frequency);
  const repetitionEnabled = ref(false);

  const frequencyXTimes: Ref<number | undefined> = ref();
  const totalDays: Ref<number | undefined> = ref();

  const repetitionUnit = [
    {
      label: t('scheduler.frequency.minute'),
      value: UnitEnum.Minute,
      unit: UnitEnum.Minute,
    },
    {
      label: t('scheduler.frequency.hour'),
      value: UnitEnum.Hour,
      unit: UnitEnum.Hour,
    },
    {
      label: t('scheduler.frequency.day'),
      value: UnitEnum.Day,
      active: true,
      unit: UnitEnum.Day,
    },
  ];

  const { errors, addError, clearAllErrors, clearError, getError } =
    useErrorQueue();

  function checkErrors(): void {
    clearAllErrors();
    if (
      !returnSchedule.value.dtstart.offset?.value ||
      !returnSchedule.value.dtstart.offset?.unit
    ) {
      addError({
        label: 'dtstart',
        value: t('scheduler.dialog.relativeSchedule.error.dtstart.addOffset'),
      });
    }
    if (
      !returnSchedule.value.dtend.offset?.value ||
      !returnSchedule.value.dtend.offset?.unit
    ) {
      addError({
        label: 'dtend',
        value: t('scheduler.dialog.relativeSchedule.error.dtend.addOffset'),
      });
    }
    if (
      returnSchedule.value.dtend.offset?.value &&
      returnSchedule.value.dtstart.offset?.value &&
      returnSchedule.value.dtstart.offset?.value >
        returnSchedule.value.dtend.offset?.value
    ) {
      addError({
        label: 'dtend',
        value: t(
          'scheduler.dialog.relativeSchedule.error.dtend.EndBeforeStart',
        ),
      });
    }
    if (
      returnSchedule.value.dtstart.time &&
      returnSchedule.value.dtend.time &&
      returnSchedule.value.dtstart.offset?.value ===
        returnSchedule.value.dtend.offset?.value &&
      returnSchedule.value.dtstart.time >= returnSchedule.value.dtend.time
    ) {
      addError({
        label: 'dtend',
        value: t(
          'scheduler.dialog.relativeSchedule.error.dtend.EndBeforeStart',
        ),
      });
    }
    if (repeatChecked.value) {
      if (
        !returnSchedule.value.rrrule?.frequency?.value ||
        !returnSchedule.value.rrrule?.frequency?.unit
      ) {
        addError({
          label: 'rrruleFreq',
          value: t('scheduler.dialog.relativeSchedule.error.rrrule.frequency'),
        });
      }
      if (
        !returnSchedule.value.rrrule?.endAfter?.value ||
        !returnSchedule.value.rrrule?.endAfter?.unit
      ) {
        addError({
          label: 'rrruleEndAfter',
          value: t('scheduler.dialog.relativeSchedule.error.rrrule.endAfter'),
        });
      }
      if (frequencyXTimes.value && frequencyXTimes.value <= 0) {
        addError({
          label: 'frequencyXTimes',
          value: 'Repetition Value is not valid',
        });
      }
    }
    scrollToFirstError();
  }

  const calcRepetition = (): void => {
    const rDtstartOffsetMin = valueToMinutes({
      value: startOffset.value.value,
      unit: startOffset.value.unit,
    });
    const rEndAfterMin = valueToMinutes({
      value: endRep.value || maxDuration.value?.value,
      unit: endRep.value ? endRepUnit.value : maxDuration.value?.unit,
    });

    const endOfIndividualStudy =
      rDtstartOffsetMin + rEndAfterMin - ONE_DAY_IN_MINUTES;

    totalDays.value = Math.round(endOfIndividualStudy / ONE_DAY_IN_MINUTES);
  };

  const offsetToMinutes = (offset: Duration): number => {
    const v = Number(offset.value ?? 0);
    switch (offset.unit) {
      case UnitEnum.Minute:
        return v;
      case UnitEnum.Hour:
        return v * 60;
      case UnitEnum.Day:
        return v * 24 * 60;
      default:
        return v * 24 * 60;
    }
  };

  const timeOfDayMinutes = (t: DateTime): number => {
    return t.hour * 60 + t.minute + Math.floor(t.second / 60);
  };

  const startTotalMinutes = computed(
    () =>
      offsetToMinutes(startOffset.value) + timeOfDayMinutes(startTime.value),
  );

  const endTotalMinutes = computed(
    () => offsetToMinutes(endOffset.value) + timeOfDayMinutes(endTime.value),
  );

  const maxDurationInMinutes = computed(() =>
    Math.max(0, endTotalMinutes.value - startTotalMinutes.value),
  );

  function cancel(): void {
    dialogRef.value.close();
  }

  function save(): void {
    if (
      returnSchedule.value.random &&
      returnSchedule.value.random.state &&
      typeof returnSchedule.value.random.duration === 'number' &&
      (returnSchedule.value.random.duration <= 0 ||
        returnSchedule.value.random.duration > maxDurationInMinutes.value)
    ) {
      toast.add({
        summary: t('scheduler.randomization.toast.title'),
        detail: t('scheduler.randomization.toast.message'),
        severity: 'error',
      });
      return;
    }
    returnSchedule.value.dtstart.time = startTime.value.toFormat(timeFormat);
    returnSchedule.value.dtend.time = endTime.value.toFormat(timeFormat);

    returnSchedule.value.dtstart.offset = startOffset.value;
    returnSchedule.value.dtend.offset = endOffset.value;

    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof returnSchedule.value.dtstart.time !== 'undefined') {
      returnSchedule.value.dtstart.timezone = currentTimeZone;
    }
    if (typeof returnSchedule.value.dtend.time !== 'undefined') {
      returnSchedule.value.dtend.timezone = currentTimeZone;
    }

    if (repeatChecked.value) {
      returnSchedule.value.rrrule = {
        frequency: {
          value: frequency.value,
          unit: frequencyUnit.value,
        },
        endAfter: {
          value: endRep.value,
          unit: endRepUnit.value,
        },
      };
    } else {
      returnSchedule.value.rrrule = undefined;
    }

    checkErrors();

    if (errors.value.length) {
      returnSchedule.value.dtstart.time =
        returnSchedule.value.dtstart.time ??
        startTime.value.toFormat(timeFormat);
      returnSchedule.value.dtend.time =
        returnSchedule.value.dtend.time ?? endTime.value.toFormat(timeFormat);
    } else {
      dialogRef.value.close(returnSchedule.value);
    }
  }

  const onChange = (): void => {
    if (maxDuration.value) {
      const errorInEvent = correctEvent(
        startOffset.value,
        endOffset.value,
        startTime.value,
        endTime.value,
        maxDuration.value,
      );
      if (errorInEvent) {
        addError(errorInEvent);
      }
      const correctedRepetition = correctEventRepetition(
        startOffset.value,
        startTime.value,
        endOffset.value,
        endTime.value,
        {
          value: frequency.value,
          unit: frequencyUnit.value,
        },
        {
          value: endRep.value,
          unit: endRepUnit.value,
        },
        maxDuration.value,
        !repeatChecked.value,
      );
      repetitionEnabled.value = correctedRepetition.repetitionEnabled;
      frequencyXTimes.value = correctedRepetition.numberOfRepetitions;
      if (!correctedRepetition.repetitionEnabled) {
        repeatChecked.value = false;
      }
      if (repeatChecked.value) {
        if (correctedRepetition.frequencyError) {
          addError(correctedRepetition.frequencyError);
        }
        if (correctedRepetition.frequencyEndError) {
          addError(correctedRepetition.frequencyEndError);
        }
      }
      scrollToFirstError();
    }
    calcRepetition();
  };

  function onRandomStateChange(newState: boolean): void {
    if (!returnSchedule.value.random) {
      returnSchedule.value.random = { state: false, duration: 0 };
    }
    returnSchedule.value.random.state = newState;
  }

  function onRandomDurationChange(newDuration: number | undefined): void {
    if (!newDuration) {
      return;
    }
    if (!returnSchedule.value.random) {
      returnSchedule.value.random = { state: false, duration: 0 };
    }
    returnSchedule.value.random.state = true;
    if (maxDurationInMinutes.value < newDuration) {
      returnSchedule.value.random.duration = maxDurationInMinutes.value;
    } else {
      returnSchedule.value.random.duration = newDuration;
    }
  }

  watch(
    [
      startOffset,
      startTime,
      endOffset,
      endTime,
      frequency,
      frequencyUnit,
      endRep,
      endRepUnit,
    ],
    onChange,
    { deep: true, immediate: true },
  );
</script>

<template>
  <div class="scheduler relative">
    <div class="mb-14 grid grid-cols-6 items-center">
      <div class="col-span-6">
        {{ $t('scheduler.dialog.relativeSchedule.description') }}
      </div>

      <h6 class="col-span-6 my-4 font-medium">
        {{ $t('scheduler.dialog.singleEventTitle') }}
      </h6>

      <div class="col-span-6 grid grid-cols-6 items-center border-b-2">
        <div class="col-span-2 col-start-2 border-l-2 pl-3">
          {{ $t('scheduler.preview.unit.date') }}&nbsp;({{
            $t('scheduler.frequency.day')
          }})
        </div>
        <div class="col-span-3">
          {{ $t('scheduler.preview.unit.time') }}
        </div>
      </div>

      <div class="col-span-6 grid grid-cols-6 items-center">
        <div class="col-span-1">
          {{ $t('scheduler.dialog.relativeSchedule.startValue') }}
        </div>
        <div class="col-span-2 border-l-2 py-3 pl-3">
          <InputNumber
            v-model="startOffset.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtstartOffset')
            "
            :min="1"
            @update:model-value="
              (val) => {
                clearError(['dtstart', 'scheduleTooLong', 'startTimeBeforeEnd']);
                startOffset.value = (val || 1) as number;
              }
            "
          />
        </div>
        <div class="col-span-3">
          <Calendar
            :model-value="startTime.toJSDate()"
            time-only
            hour-format="24"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtstartTime')
            "
            @update:model-value="
              (newVal) => {
                const dateVal = Array.isArray(newVal) ? newVal[0] : newVal;
                startTime = createLuxonDateTime(dateVal || '') || startTime;
                clearError(['offsetCorrection']);
              }
            "
          />
        </div>
      </div>
      <ErrorLabel
        :error="getError('dtstart')"
        class="col-span-5 col-start-2 border-l-2 pl-3"
      />

      <div class="col-span-6 grid grid-cols-6 items-center">
        <div class="col-span-1">
          {{ $t('scheduler.dialog.relativeSchedule.endValue') }}
        </div>
        <div class="col-span-2 border-l-2 py-3 pl-3">
          <InputNumber
            v-model="endOffset.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtendOffset')
            "
            :min="1"
            @update:model-value="
              (val) => {
                clearError(['dtend', 'startTimeBeforeEnd', 'offsetCorrection']);
                endOffset.value = (val || 1) as number;
              }
            "
          />
        </div>
        <div class="col-span-3">
          <Calendar
            :model-value="endTime.toJSDate()"
            time-only
            hour-format="24"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtendTime')
            "
            @update:model-value="
              (newVal) => {
                const dateVal = Array.isArray(newVal) ? newVal[0] : newVal;
                endTime = createLuxonDateTime(dateVal || '') || endTime;
                clearError(['startTimeBeforeEnd', 'offsetCorrection']);
              }
            "
          />
        </div>
      </div>
      <ErrorLabel
        :error="getError(['dtend', 'offsetCorrection'])"
        class="col-span-5 col-start-2 border-l-2 pl-3"
      />
    </div>

    <h6 class="col-span-6 my-4 font-medium">
      {{ $t('scheduler.dialog.repeatEventTitle') }}
    </h6>
    <div
      :class="[
        'col-span-6 mb-4 flex flex-row items-center',
        {
          'cursor-not-allowed': !repetitionEnabled,
          'cursor-pointer': repetitionEnabled,
        },
      ]"
      @click="repeatChecked = !repeatChecked"
    >
      <Checkbox
        v-model="repeatChecked"
        :disabled="!repetitionEnabled"
        binary
        @update:model-value="calcRepetition()"
        @click.stop
      />
      <span class="ms-2">{{ $t('scheduler.dialog.repeatEvent') }}</span>
    </div>
    <div class="flex flex-row items-center justify-start">
      <span>{{ $t('scheduler.randomization.label') }}:</span>
      <Checkbox
        :model-value="!!returnSchedule.random?.state"
        class="ml-2"
        binary
        @update:model-value="onRandomStateChange"
      />
    </div>
    <div v-if="repeatChecked" class="col-span-6 pb-5">
      <div class="mb-5">
        {{ $t('scheduler.dialog.repeatEventDescription') }}
      </div>
      <div class="grid grid-cols-6 items-center">
        <div class="col-span-1">
          {{ $t('scheduler.dialog.repeatEvery') }}
        </div>
        <div class="col-span-5 flex border-l-2 py-3 pl-3">
          <InputNumber
            v-model="frequency"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.enterNumber')
            "
            :min="1"
            @update:model-value="
              (val) => {
                clearError(['rrruleFreq', 'frequencyError']);
                frequency = (val || 1) as number;
              }
            "
          />
          <Dropdown
            v-model="frequencyUnit"
            :options="repetitionUnit"
            :option-label="'label'"
            :option-value="'value'"
            class="col-span-3 ml-4"
            @update:model-value="clearError(['rrruleFreq', 'frequencyError'])"
          />
        </div>
        <ErrorLabel
          :error="getError(['rrruleFreq', 'frequencyError'])"
          class="col-span-5 col-start-2 border-l-2 pl-3"
        />

        <div class="col-span-1">
          {{ $t('scheduler.dialog.endAfter') }}
        </div>
        <div class="col-span-5 flex border-l-2 py-3 pl-3">
          <InputNumber
            v-model="endRep"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.enterNumber')
            "
            class="z-10"
            :min="1"
            @update:model-value="
              (val) => {
                clearError(['rrruleEndAfter', 'frequencyEndError']);
                endRep = (val || 1) as number;
              }
            "
          />
          <Dropdown
            v-model="endRepUnit"
            :options="repetitionUnit"
            option-label="label"
            option-value="value"
            class="z-10 col-span-3 ml-4"
            @update:model-value="clearError(['rrruleEndAfter', 'frequencyEndError'])"
          />
        </div>
        <ErrorLabel
          :error="getError(['rrruleEndAfter', 'frequencyEndError'])"
          class="col-span-5 col-start-2 border-l-2 pl-3"
        />
      </div>
      <div class="col-span-6 pt-6">
        {{
          `${$t('scheduler.dialog.relativeSchedule.rrrule.endsAfter', totalDays)}.`
        }}
        {{
          $t('scheduler.dialog.relativeSchedule.rrrule.runTime', {
            repetitionNum: frequencyXTimes,
          })
        }}
      </div>
    </div>
    <div v-else-if="!repetitionEnabled" class="flex items-center gap-1">
      <span class="pi pi-info-circle" />
      {{ $t('scheduler.dialog.relativeSchedule.error.cannotRepeat') }}
    </div>

    <RandomizationView
      v-if="!!returnSchedule.random?.state"
      class="col-span-8"
      :duration="returnSchedule.random?.duration ?? 0"
      :max-duration-in-minutes="maxDurationInMinutes"
      @update:duration="onRandomDurationChange"
    />

    <div class="grid w-full grid-cols-6">
      <div
        class="col-start-0 col-span-6 mt-8 flex flex-row items-center justify-end text-right"
      >
        <Button
          class="btn-gray !mr-3"
          :label="$t('global.labels.cancel')"
          @click="cancel()"
        />
        <Button
          :disabled="errors.length > 0"
          :label="$t('global.labels.save')"
          @click="save()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  :deep(.highlight input) {
    background-color: var(--red-200) !important;
  }

  .scheduler {
    min-height: 37.5rem;

    input::placeholder {
      color: var(--bluegray-300);
    }

    h6 {
      color: var(--primary-color);
    }
  }

  :deep(.input-error input) {
    background: var(--red-200);
  }
</style>

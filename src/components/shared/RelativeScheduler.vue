<script setup lang="ts">
  import { computed, inject, ref, Ref, watch } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import Checkbox from 'primevue/checkbox';
  import {
    Duration,
    DurationUnitEnum,
    RelativeEvent,
  } from '../../generated-sources/openapi';
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

  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');
  const studyStore = useStudyStore();
  const { study } = storeToRefs(studyStore);
  const maxDuration = computed((): Duration | undefined =>
    calcStudyDurationFromStudy(study.value),
  );

  const schedule: RelativeEvent = dialogRef.value.data.scheduler;

  const startOffset = ref<Duration>({
    value: schedule.dtstart?.offset?.value ?? 1,
    unit: DurationUnitEnum.Day,
  });
  const startTime = ref<DateTime>(
    DateTime.now().set({ hour: 10, minute: 30, second: 0 }),
  );

  const endOffset = ref<Duration>({
    value: schedule.dtend?.offset?.value ?? 1,
    unit: DurationUnitEnum.Day,
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

  const returnSchedule: RelativeEvent = {
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
  };

  const frequency = ref<Duration>({
    value: schedule.rrrule?.frequency?.value ?? 1,
    unit: schedule.rrrule?.frequency?.unit ?? DurationUnitEnum.Day,
  });

  const endRep = ref<Duration>({
    value: schedule.rrrule?.endAfter?.value ?? 4,
    unit: schedule.rrrule?.endAfter?.unit ?? DurationUnitEnum.Day,
  });

  const repeatChecked: Ref<boolean> = ref(!!schedule.rrrule?.frequency);
  const repetitionEnabled = ref(false);

  const frequencyXTimes: Ref<number | undefined> = ref();
  const totalDays: Ref<number | undefined> = ref();

  if (schedule.rrrule?.frequency && schedule.rrrule?.endAfter) {
    calcRepetition();
  }

  const repetitionUnit = [
    {
      label: t('scheduler.frequency.minute'),
      value: DurationUnitEnum.Minute,
      unit: DurationUnitEnum.Minute,
    },
    {
      label: t('scheduler.frequency.hour'),
      value: DurationUnitEnum.Hour,
      unit: DurationUnitEnum.Hour,
    },
    {
      label: t('scheduler.frequency.day'),
      value: DurationUnitEnum.Day,
      active: true,
      unit: DurationUnitEnum.Day,
    },
  ];

  const { errors, addError, clearAllErrors, clearError, getError } =
    useErrorQueue();

  function checkErrors(): void {
    clearAllErrors();
    if (
      !returnSchedule.dtstart.offset?.value ||
      !returnSchedule.dtstart.offset?.unit
    ) {
      addError({
        label: 'dtstart',
        value: t('scheduler.dialog.relativeSchedule.error.dtstart.addOffset'),
      });
    }
    if (
      !returnSchedule.dtend.offset?.value ||
      !returnSchedule.dtend.offset?.unit
    ) {
      addError({
        label: 'dtend',
        value: t('scheduler.dialog.relativeSchedule.error.dtend.addOffset'),
      });
    }
    if (
      returnSchedule.dtend.offset?.value &&
      returnSchedule.dtstart.offset?.value &&
      returnSchedule.dtstart.offset?.value > returnSchedule.dtend.offset?.value
    ) {
      addError({
        label: 'dtend',
        value: t(
          'scheduler.dialog.relativeSchedule.error.dtend.EndBeforeStart',
        ),
      });
    }
    if (
      returnSchedule.dtstart.time &&
      returnSchedule.dtend.time &&
      returnSchedule.dtstart.offset?.value ===
        returnSchedule.dtend.offset?.value &&
      returnSchedule.dtstart.time >= returnSchedule.dtend.time
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
        !returnSchedule.rrrule?.frequency?.value ||
        !returnSchedule.rrrule?.frequency?.unit
      ) {
        addError({
          label: 'rrruleFreq',
          value: t('scheduler.dialog.relativeSchedule.error.rrrule.frequency'),
        });
      }
      if (
        !returnSchedule.rrrule?.endAfter?.value ||
        !returnSchedule.rrrule?.endAfter?.unit
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

  function calcRepetition(): void {
    if (!repeatChecked.value) {
      return;
    }

    const startValue = startOffset.value.value;
    const endRepValue = endRep.value.value || maxDuration.value?.value;
    const endRepUnit = endRep.value.value
      ? endRep.value.unit
      : maxDuration.value?.unit;
    const frequencyValue = frequency.value.value;

    if (
      startValue &&
      (endRepValue || maxDuration.value?.value) &&
      frequencyValue
    ) {
      const rDtstartOffsetMin = valueToMinutes({
        value: startValue,
        unit: startOffset.value.unit,
      });
      const rEndAfterMin = valueToMinutes({
        value: endRepValue,
        unit: endRepUnit,
      });

      const endOfIndividualStudy = rDtstartOffsetMin + rEndAfterMin - 1440;

      totalDays.value = Math.round(endOfIndividualStudy / 1440);
    }
  }

  function cancel(): void {
    dialogRef.value.close();
  }

  function save(): void {
    returnSchedule.dtstart.time = startTime.value.toFormat('HH:mm:ss');
    returnSchedule.dtend.time = endTime.value.toFormat('HH:mm:ss');

    returnSchedule.dtstart.offset = startOffset.value;
    returnSchedule.dtend.offset = endOffset.value;

    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof returnSchedule.dtstart.time !== 'undefined') {
      returnSchedule.dtstart.timezone = currentTimeZone;
    }
    if (typeof returnSchedule.dtend.time !== 'undefined') {
      returnSchedule.dtend.timezone = currentTimeZone;
    }

    if (repeatChecked.value) {
      returnSchedule.rrrule = {
        frequency: frequency.value,
        endAfter: endRep.value,
      };
    } else {
      returnSchedule.rrrule = undefined;
    }

    checkErrors();

    if (errors.value.length) {
      returnSchedule.dtstart.time =
        returnSchedule.dtstart.time ?? startTime.value.toFormat('HH:mm');
      returnSchedule.dtend.time =
        returnSchedule.dtend.time ?? endTime.value.toFormat('HH:mm');
    } else {
      dialogRef.value.close(returnSchedule);
    }
  }

  watch(
    [startOffset, endOffset, startTime, endTime, frequency, endRep],
    ([
      newStartOffset,
      newEndOffset,
      newStartTime,
      newEndTime,
      newFrequency,
      newEndRep,
    ]) => {
      if (maxDuration.value) {
        const errorInEvent = correctEvent(
          newStartOffset,
          newEndOffset,
          newStartTime,
          newEndTime,
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
          newFrequency,
          newEndRep,
          maxDuration.value,
          !repeatChecked.value,
        );
        repetitionEnabled.value = correctedRepetition.repetitionEnabled;
        frequencyXTimes.value = correctedRepetition.numberOfRepetitions;
        if (!correctedRepetition.repetitionEnabled) {
          repeatChecked.value = false;
        }
        calcRepetition();
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
    },
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
            @blur="calcRepetition()"
            @input="
              clearError(['dtstart', 'scheduleTooLong', 'startTimeBeforeEnd'])
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
                startTime = createLuxonDateTime(dateVal) || startTime;
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
            @blur="calcRepetition()"
            @input="
              clearError(['dtend', 'startTimeBeforeEnd', 'offsetCorrection'])
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
                endTime = createLuxonDateTime(dateVal) || endTime;
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
        'col-span-6 mb-4',
        {
          'cursor-not-allowed': !repetitionEnabled,
          'cursor-pointer': repetitionEnabled,
        },
      ]"
      @click="repeatChecked = !repeatChecked"
    >
      <Checkbox
        v-model="repeatChecked"
        class="ml-2"
        :disabled="!repetitionEnabled"
        binary
        @input="calcRepetition()"
        @click.stop
      />
      <span class="ml-4">{{ $t('scheduler.dialog.repeatEvent') }}</span>
    </div>
    <div v-if="repeatChecked" class="col-span-6 pb-5">
      <div class="mb-7">
        {{ $t('scheduler.dialog.repeatEventDescription') }}
      </div>

      <div class="grid grid-cols-6 items-center">
        <div class="col-span-1">
          {{ $t('scheduler.dialog.repeatEvery') }}
        </div>
        <div class="col-span-3 flex border-l-2 py-3 pl-3">
          <InputNumber
            v-model="frequency.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.enterNumber')
            "
            :min="1"
            @input="clearError(['rrruleFreq', 'frequencyError'])"
          />
          <Dropdown
            v-model="frequency.unit"
            :options="repetitionUnit"
            :option-label="'label'"
            :option-value="'value'"
            class="col-span-3 ml-4"
            @change="clearError(['rrruleFreq', 'frequencyError'])"
          />
        </div>
        <div v-if="frequencyXTimes !== undefined" class="col-span-2">
          {{
            $t('scheduler.dialog.relativeSchedule.rrrule.runTime', {
              repetitionNum: frequencyXTimes,
            })
          }}
        </div>
        <ErrorLabel
          :error="getError(['rrruleFreq', 'frequencyError'])"
          class="col-span-5 col-start-2 border-l-2 pl-3"
        />

        <div class="col-span-1">
          {{ $t('scheduler.dialog.endAfter') }}
        </div>
        <div class="col-span-3 flex border-l-2 py-3 pl-3">
          <InputNumber
            v-model="endRep.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.enterNumber')
            "
            class="z-10"
            :min="1"
            @input="clearError(['rrruleEndAfter', 'frequencyEndError'])"
          />
          <Dropdown
            v-model="endRep.unit"
            :options="repetitionUnit"
            option-label="label"
            option-value="value"
            class="z-10 col-span-3 ml-4"
            @change="clearError(['rrruleEndAfter', 'frequencyEndError'])"
          />
        </div>
        <div v-if="totalDays && totalDays > 0" class="col-span-2">
          {{
            `${$t('scheduler.dialog.relativeSchedule.rrrule.endsAfter', totalDays)} `
          }}
        </div>
        <ErrorLabel
          :error="getError(['rrruleEndAfter', 'frequencyEndError'])"
          class="col-span-5 col-start-2 border-l-2 pl-3"
        />
      </div>
    </div>
    <div v-else-if="!repetitionEnabled" class="flex items-center gap-1">
      <span class="pi pi-info-circle" />
      {{ $t('scheduler.dialog.relativeSchedule.error.cannotRepeat') }}
    </div>

    <div class="grid w-full grid-cols-6">
      <div class="col-start-0 col-span-6 mt-8 justify-end text-right">
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

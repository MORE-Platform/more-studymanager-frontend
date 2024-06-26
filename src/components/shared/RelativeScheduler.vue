<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import Checkbox from 'primevue/checkbox';
  import {
    RelativeEvent,
    RelativeRecurrenceRule,
    Duration,
    DurationUnitEnum,
  } from '../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import { ScheduleType } from '../../models/Scheduler';

  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');

  const schedule: RelativeEvent = dialogRef.value.data.scheduler;

  const returnSchedule: RelativeEvent = {
    type: ScheduleType.RelativeEvent,
    dtstart: {
      offset: {
        value: schedule.dtstart?.offset?.value,
        unit: schedule.dtstart?.offset?.unit,
      },
      time: schedule.dtstart?.time,
      timezone: schedule.dtstart?.timezone,
    },
    dtend: {
      offset: {
        value: schedule.dtend?.offset?.value,
        unit: schedule.dtend?.offset?.unit,
      },
      time: schedule.dtend?.time,
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

  const startTime: Ref<Date> = ref(new Date());
  const endTime: Ref<Date> = ref(new Date());

  if (schedule.dtstart && schedule.dtstart.time) {
    startTime.value.setHours(
      parseInt(schedule.dtstart.time?.substring(0, 2)),
      parseInt(schedule.dtstart.time?.substring(3, 5), 0),
    );
  } else {
    startTime.value.setHours(10, 30);
  }
  if (schedule.dtend && schedule.dtend.time) {
    endTime.value.setHours(
      parseInt(schedule.dtend.time?.substring(0, 2)),
      parseInt(schedule.dtend.time?.substring(3, 5), 0),
    );
  } else {
    endTime.value.setHours(18, 30);
  }

  returnSchedule.dtstart.time = returnSchedule.dtstart.time ?? '10:00';
  returnSchedule.dtend.time = returnSchedule.dtend.time ?? '18:00';

  const rFrequency: Ref<Duration> = ref({
    value: schedule.rrrule?.frequency?.value ?? 1,
    unit: schedule.rrrule?.frequency?.unit ?? DurationUnitEnum.Day,
  } as Duration);
  const rEndAfter: Ref<Duration> = ref({
    value: schedule.rrrule?.endAfter?.value ?? 4,
    unit: schedule.rrrule?.endAfter?.unit ?? DurationUnitEnum.Day,
  } as Duration);

  const rDtstartOffset: Ref<Duration> = ref({
    value: schedule.dtstart?.offset?.value ?? 1,
    unit: DurationUnitEnum.Day,
  } as Duration);
  const rDtendOffset: Ref<Duration> = ref({
    value: schedule.dtend?.offset?.value ?? 2,
    unit: DurationUnitEnum.Day,
  } as Duration);

  const repeatChecked: Ref<boolean> = ref(!!schedule.rrrule?.frequency);

  const frequencyXTimes: Ref<number | undefined> = ref();
  const totalDays: Ref<number | undefined> = ref();

  if (schedule.rrrule?.frequency && schedule.rrrule?.endAfter) {
    calculatedRepeat();
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

  let errors: MoreTableChoice[] = [];

  function getError(label: string): string | null | undefined {
    return errors.find((el) => el.label === label)?.value;
  }

  function checkErrors(): void {
    errors = [];
    if (
      !returnSchedule.dtstart.offset?.value ||
      !returnSchedule.dtstart.offset?.unit
    ) {
      errors.push({
        label: 'dtstart',
        value: t('scheduler.dialog.relativeSchedule.error.dtstart.addOffset'),
      });
    }
    if (
      !returnSchedule.dtend.offset?.value ||
      !returnSchedule.dtend.offset?.unit
    ) {
      errors.push({
        label: 'dtend',
        value: t('scheduler.dialog.relativeSchedule.error.dtend.addOffset'),
      });
    }
    if (
      returnSchedule.dtend.offset?.value &&
      returnSchedule.dtstart.offset?.value &&
      returnSchedule.dtstart.offset?.value > returnSchedule.dtend.offset?.value
    ) {
      errors.push({
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
      errors.push({
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
        errors.push({
          label: 'rrruleFreq',
          value: t('scheduler.dialog.relativeSchedule.error.rrrule.frequency'),
        });
      }
      if (
        !returnSchedule.rrrule?.endAfter?.value ||
        !returnSchedule.rrrule?.endAfter?.unit
      ) {
        errors.push({
          label: 'rrruleEndAfter',
          value: t('scheduler.dialog.relativeSchedule.error.rrrule.endAfter'),
        });
      }
      if (frequencyXTimes.value && frequencyXTimes.value <= 0) {
        errors.push({
          label: 'frequencyXTimes',
          value: 'Repetition Value is not valid',
        });
      }
    }
  }

  function calculatedRepeat(): void {
    if (!repeatChecked.value) {
      return;
    }

    if (
      rDtendOffset.value.value &&
      rDtstartOffset.value.value &&
      rFrequency.value.value &&
      rEndAfter.value.value
    ) {
      const rDtstartOffsetMin = valueToMinutes(
        rDtstartOffset.value.value,
        rDtstartOffset.value.unit,
      );
      const rEndAfterMin = valueToMinutes(
        rEndAfter.value.value,
        rEndAfter.value.unit,
      );
      const rFrequencyMin = valueToMinutes(
        rFrequency.value.value,
        rFrequency.value.unit,
      );

      const endOfIndividualStudy: number =
        rDtstartOffsetMin + rEndAfterMin - 1440;
      const totalFrequency = rEndAfterMin / rFrequencyMin;

      frequencyXTimes.value =
        totalFrequency % 1 !== 0
          ? totalFrequency - (totalFrequency % 1) + 1
          : totalFrequency - (totalFrequency % 1);
      totalDays.value = Math.round(endOfIndividualStudy / 1440);
    }
  }

  function valueToMinutes(
    value: number,
    unit: DurationUnitEnum | undefined,
  ): number {
    // day to minutes  -> 1440 minutes
    // hour to minutes -> 60
    switch (unit) {
      case DurationUnitEnum.Day:
        return value * 1440;
      case DurationUnitEnum.Hour:
        return value * 60;
      case DurationUnitEnum.Minute:
        return value;
      default:
        return 0;
    }
  }

  function cancel(): void {
    dialogRef.value.close();
  }

  function save(): void {
    returnSchedule.dtstart.time = startTime.value
      ?.toTimeString()
      .substring(0, 5);
    returnSchedule.dtend.time = endTime.value?.toTimeString().substring(0, 5);

    returnSchedule.dtstart.offset = rDtstartOffset.value;
    returnSchedule.dtend.offset = rDtendOffset.value;

    if (typeof returnSchedule.dtstart.time !== 'undefined') {
      returnSchedule.dtstart.timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    if (typeof returnSchedule.dtend.time !== 'undefined') {
      returnSchedule.dtend.timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    if (repeatChecked.value) {
      returnSchedule.rrrule = {
        frequency: rFrequency.value,
        endAfter: rEndAfter.value,
      } as RelativeRecurrenceRule;
    } else {
      returnSchedule.rrrule = undefined;
    }

    checkErrors();

    if (errors.length) {
      returnSchedule.dtstart.time = returnSchedule.dtstart.time ?? '10:00';
      returnSchedule.dtend.time = returnSchedule.dtend.time ?? '18:00';
    } else {
      dialogRef.value.close(returnSchedule);
    }
  }
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
            v-model="rDtstartOffset.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtstartOffset')
            "
            :min="1"
            @blur="calculatedRepeat()"
          />
        </div>
        <div class="col-span-3">
          <Calendar
            v-model="startTime"
            time-only
            hour-format="24"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtstartTime')
            "
          />
        </div>
      </div>
      <div
        v-if="getError('dtstart')"
        class="error col-span-5 col-start-2 border-l-2 pb-3 pl-3"
      >
        {{ getError('dtstart') }}
      </div>

      <div class="col-span-6 grid grid-cols-6 items-center">
        <div class="col-span-1">
          {{ $t('scheduler.dialog.relativeSchedule.endValue') }}
        </div>
        <div class="col-span-2 border-l-2 py-3 pl-4">
          <InputNumber
            v-model="rDtendOffset.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtendOffset')
            "
            :min="1"
            @blur="calculatedRepeat()"
          />
        </div>
        <div class="col-span-3">
          <Calendar
            v-model="endTime"
            time-only
            hour-format="24"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtendTime')
            "
          />
        </div>
      </div>
      <div
        v-if="getError('dtend')"
        class="error col-span-5 col-start-2 border-l-2 pb-3 pl-4"
      >
        {{ getError('dtend') }}
      </div>
    </div>

    <h6 class="col-span-6 my-4 font-medium">
      {{ $t('scheduler.dialog.repeatEventTitle') }}
    </h6>
    <div class="col-span-6 mb-4">
      <Checkbox
        v-model="repeatChecked"
        class="ml-2"
        :binary="true"
        @input="calculatedRepeat()"
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
        <div class="col-span-3 flex border-l-2 py-3 pl-4">
          <InputNumber
            v-model="rFrequency.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.enterNumber')
            "
            @blur="calculatedRepeat()"
          />
          <Dropdown
            v-model="rFrequency.unit"
            :options="repetitionUnit"
            :option-label="'label'"
            :option-value="'value'"
            class="col-span-3 ml-4"
            @change="calculatedRepeat()"
          />
        </div>
        <div class="col-span-2">
          <div v-if="frequencyXTimes">
            <span v-if="frequencyXTimes <= 0" class="error">
              {{
                $t('scheduler.dialog.relativeSchedule.error.rrrule.notValid')
              }}
            </span>
            <span v-else>
              {{
                `${$t(
                  'scheduler.dialog.relativeSchedule.rrrule.repeated',
                )}: ${frequencyXTimes} ${$t(
                  'scheduler.dialog.relativeSchedule.rrrule.times',
                )}`
              }}</span
            >
          </div>
        </div>
        <div
          v-if="getError('rrruleFreq')"
          class="error col-span-5 col-start-2 border-l-2 pb-3 pl-4"
        >
          {{ getError('rrruleFreq') }}
        </div>

        <div class="col-span-1">
          {{ $t('scheduler.dialog.endAfter') }}
        </div>
        <div class="col-span-3 flex border-l-2 py-3 pl-4">
          <InputNumber
            v-model="rEndAfter.value"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.enterNumber')
            "
            class="z-10"
            @blur="calculatedRepeat()"
          />
          <Dropdown
            v-model="rEndAfter.unit"
            :options="repetitionUnit"
            :option-label="'label'"
            :option-value="'value'"
            class="z-10 col-span-3 ml-4"
            @change="calculatedRepeat()"
          />
        </div>
        <div class="col-span-2">
          <div v-if="totalDays">
            {{
              `${$t('scheduler.dialog.relativeSchedule.rrrule.endsAfter', totalDays)} `
            }}
          </div>
        </div>
        <div
          v-if="getError('rrruleEndAfter')"
          class="error col-span-5 col-start-2 border-l-2 pb-3 pl-4"
        >
          {{ getError('rrruleEndAfter') }}
        </div>
      </div>
    </div>

    <div class="grid w-full grid-cols-6">
      <div class="col-start-0 col-span-6 mt-8 justify-end text-right">
        <Button class="btn-gray !mr-3" @click="cancel()">{{
          $t('global.labels.cancel')
        }}</Button>
        <Button @click="save()">{{ $t('global.labels.save') }}</Button>
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

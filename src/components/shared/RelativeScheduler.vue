<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import InputNumber from 'primevue/inputnumber';
  import Dropdown from 'primevue/dropdown';
  import Checkbox from 'primevue/checkbox';
  import { ZTimeToOffsetTime } from '../../utils/dateUtils';
  import {
    RelativeEvent,
    RelativeRecurrenceRule,
    Duration,
    DurationUnitEnum,
  } from '../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';

  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');

  const schedule: RelativeEvent = dialogRef.value.data.scheduler;

  const returnSchedule: Ref<RelativeEvent> = ref({
    type: 'RelativeEvent',
    dtstart: {
      offset: {
        value: schedule.dtstart?.offset?.value,
        unit: schedule.dtstart?.offset?.unit,
      },
      time: schedule.dtstart?.time,
    },
    dtend: {
      offset: {
        value: schedule.dtend?.offset?.value,
        unit: schedule.dtend?.offset?.unit,
      },
      time: schedule.dtend?.time,
    },
    rrrule: {
      frequency: {
        value: schedule.rrrule?.frequency?.value,
        unit: schedule.rrrule?.frequency?.unit,
      },
      endAfter: {
        value: schedule.rrrule?.endAfter?.value,
        unit: schedule.rrrule?.endAfter?.value,
      },
    },
  } as RelativeEvent);

  const startTime: Ref<Date> = ref(new Date());
  const endTime: Ref<Date> = ref(new Date());

  if (schedule.dtstart && schedule.dtstart.time) {
    startTime.value.setHours(
      parseInt(schedule.dtstart.time?.substring(0, 2)),
      parseInt(schedule.dtstart.time?.substring(3, 5), 0)
    );
    startTime.value = ZTimeToOffsetTime(startTime.value);
  } else {
    startTime.value.setHours(10, 30);
  }
  if (schedule.dtend && schedule.dtend.time) {
    endTime.value.setHours(
      parseInt(schedule.dtend.time?.substring(0, 2)),
      parseInt(schedule.dtend.time?.substring(3, 5), 0)
    );
    endTime.value = ZTimeToOffsetTime(endTime.value);
  } else {
    endTime.value.setHours(18, 30);
  }

  returnSchedule.value.dtstart.time = returnSchedule.value.dtstart.time
    ? returnSchedule.value.dtstart.time
    : '10:10';
  returnSchedule.value.dtend.time = returnSchedule.value.dtend.time
    ? returnSchedule.value.dtend.time
    : '18:00';

  const rFrequency: Ref<Duration> = ref({
    value: schedule.rrrule?.frequency?.value
      ? schedule.rrrule?.frequency?.value
      : 1,
    unit: schedule.rrrule?.frequency?.unit
      ? schedule.rrrule?.frequency?.unit
      : DurationUnitEnum.Day,
  } as Duration);
  const rEndAfter: Ref<Duration> = ref({
    value: schedule.rrrule?.endAfter?.value
      ? schedule.rrrule?.endAfter?.value
      : 4,
    unit: schedule.rrrule?.endAfter?.unit
      ? schedule.rrrule?.endAfter?.unit
      : DurationUnitEnum.Day,
  } as Duration);

  const rDtstartOffset: Ref<Duration> = ref({
    value: schedule.dtstart?.offset?.value
      ? schedule.dtstart?.offset?.value
      : 1,
    unit: DurationUnitEnum.Day,
  } as Duration);
  const rDtendOffset: Ref<Duration> = ref({
    value: schedule.dtend?.offset?.value ? schedule.dtend?.offset?.value : 2,
    unit: DurationUnitEnum.Day,
  } as Duration);

  const repeatChecked: Ref<boolean> = ref(
    schedule.rrrule?.frequency ? true : false
  );

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

  const errors: Ref<Array<MoreTableChoice>> = ref([]);

  function getError(label: string): string | null | undefined {
    const item = errors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
  }

  function checkErrors() {
    errors.value = [];
    if (
      !returnSchedule.value.dtstart.offset?.value ||
      !returnSchedule.value.dtstart.offset?.unit
    ) {
      errors.value.push({
        label: 'dtstart',
        value: t('schedule.relativeSchedule.error.dtstart.addOffset'),
      });
    }
    if (
      !returnSchedule.value.dtend.offset?.value ||
      !returnSchedule.value.dtend.offset?.unit
    ) {
      errors.value.push({
        label: 'dtend',
        value: t('schedule.relativeSchedule.error.dtend.addOffset'),
      });
    }
    if (repeatChecked.value) {
      if (
        !returnSchedule.value.rrrule?.frequency?.value ||
        !returnSchedule.value.rrrule?.frequency?.unit
      ) {
        errors.value.push({
          label: 'rrruleFreq',
          value: t('schedule.relativeSchedule.error.rrrule.frequency'),
        });
      }
      if (
        !returnSchedule.value.rrrule?.endAfter?.value ||
        !returnSchedule.value.rrrule?.endAfter?.unit
      ) {
        errors.value.push({
          label: 'rrruleEndAfter',
          value: t('schedule.relativeSchedule.error.rrrule.endAfter'),
        });
      }
      if (frequencyXTimes.value && frequencyXTimes.value <= 0) {
        errors.value.push({
          label: 'frequencyXTimes',
          value: 'Repetition Value is not valid',
        });
      }
    }
  }

  function calculatedRepeat() {
    if (repeatChecked.value) {
      if (
        rDtendOffset.value.value &&
        rDtstartOffset.value.value &&
        rFrequency.value.value &&
        rEndAfter.value.value
      ) {
        const rDtstartOffsetMin = valueToMinutes(
          rDtstartOffset.value.value,
          rDtstartOffset.value.unit
        );
        const rEndAfterMin = valueToMinutes(
          rEndAfter.value.value,
          rEndAfter.value.unit
        );
        const rFrequencyMin = valueToMinutes(
          rFrequency.value.value,
          rFrequency.value.unit
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
  }

  function valueToMinutes(
    value: number,
    unit: DurationUnitEnum | undefined
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

  function cancel() {
    dialogRef.value.close();
  }

  function save() {
    returnSchedule.value.dtstart.time = startTime.value
      ?.toISOString()
      .substring(11, 16);
    returnSchedule.value.dtend.time = endTime.value
      ?.toISOString()
      .substring(11, 16);

    returnSchedule.value.dtstart.offset = rDtstartOffset.value;
    returnSchedule.value.dtend.offset = rDtendOffset.value;

    if (repeatChecked.value) {
      const rrrule: RelativeRecurrenceRule = {
        frequency: rFrequency.value,
        endAfter: rEndAfter.value,
      };

      returnSchedule.value.rrrule = rrrule;
    } else {
      returnSchedule.value.rrrule = undefined;
    }

    checkErrors();

    if (errors.value.length) {
      returnSchedule.value.dtstart.time = returnSchedule.value.dtstart.time
        ? returnSchedule.value.dtstart.time
        : '10:00';
      returnSchedule.value.dtend.time = returnSchedule.value.dtend.time
        ? returnSchedule.value.dtend.time
        : '18:00';
    } else {
      dialogRef.value.close(returnSchedule.value);
    }
  }
</script>

<template>
  <div class="scheduler relative">
    <div class="grid grid-cols-6 items-center">
      <div class="col-span-6">
        {{ $t('scheduler.dialog.relativeSchedule.description') }}
      </div>

      <h6 class="col-span-6 mb-4 mt-4">
        {{ $t('scheduler.dialog.singleEventTitle') }}
      </h6>

      <div class="col-span-6 grid grid-cols-6 items-center border-b-2">
        <div class="bt-2 col-span-2 col-start-2 border-l-2 pl-4 pb-2">
          {{ $t('scheduler.preview.unit.date') }}
        </div>
        <div class="col-span-3 ml-2">
          {{ $t('scheduler.preview.unit.time') }}
        </div>
      </div>

      <div class="col-span-6 grid grid-cols-6 items-center">
        <div class="col-span-1">
          {{ $t('scheduler.dialog.relativeSchedule.startValue') }}
        </div>
        <div class="col-span-2 border-l-2 pl-4 pt-3 pb-3">
          <span>{{ $t('scheduler.frequency.day') }}</span>
          <InputNumber
            v-model="rDtstartOffset.value"
            class="ml-2"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtstartOffset')
            "
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
        class="error col-span-5 col-start-2 border-l-2 pl-4 pb-3"
      >
        {{ getError('dtstart') }}
      </div>

      <div class="col-span-6 grid grid-cols-6 items-center">
        <div class="col-span-1">
          {{ $t('scheduler.dialog.relativeSchedule.endValue') }}
        </div>
        <div class="col-span-2 border-l-2 pl-4 pt-3 pb-3">
          <span>{{ $t('scheduler.frequency.day') }}</span>
          <InputNumber
            v-model="rDtendOffset.value"
            class="ml-2"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.placeholder.dtendOffset')
            "
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
        class="error col-span-5 col-start-2 border-l-2 pl-4 pb-3"
      >
        {{ getError('dtend') }}
      </div>
    </div>

    <h6 class="col-span-6 mt-14 mb-4">
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
        <div class="col-span-3 flex border-l-2 pl-4 pt-3 pb-3">
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
            <span v-if="frequencyXTimes && frequencyXTimes <= 0" class="error">
              {{
                $t('scheduler.dialog.relativeSchedule.error.rrrule.notValid')
              }}
            </span>
            <span v-else>
              {{
                `${$t(
                  'scheduler.dialog.relativeSchedule.rrrule.repeated'
                )}: ${frequencyXTimes} ${$t(
                  'scheduler.dialog.relativeSchedule.rrrule.times'
                )}`
              }}</span
            >
          </div>
        </div>
        <div
          v-if="getError('rrruleFreq')"
          class="error col-span-5 col-start-2 border-l-2 pl-4 pb-3"
        >
          {{ getError('rrruleFreq') }}
        </div>

        <div class="col-span-1">
          {{ $t('scheduler.dialog.endAfter') }}
        </div>
        <div class="col-span-3 flex border-l-2 pl-4 pt-3 pb-3">
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
              `${$t(
                'scheduler.dialog.relativeSchedule.rrrule.ends'
              )} ${totalDays} ${$t(
                'scheduler.dialog.relativeSchedule.rrrule.endsAfter'
              )} `
            }}
          </div>
        </div>
        <div
          v-if="getError('rrruleEndAfter')"
          class="error col-span-5 col-start-2 border-l-2 pl-4 pb-3"
        >
          {{ getError('rrruleEndAfter') }}
        </div>
      </div>
    </div>

    <div class="grid w-full grid-cols-6">
      <div class="col-start-0 buttons col-span-6 mt-8 justify-end text-right">
        <Button class="btn-gray" @click="cancel()">{{
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

    .pos-bottom {
      position: absolute;
      bottom: 1.25rem;
      right: 1.25rem;
    }

    input::placeholder {
      color: var(--bluegray-300);
    }

    h6 {
      color: var(--primary-color);
      font-weight: 500;
    }
  }

  .buttons {
    button {
      margin-left: 10px;
    }
  }

  :deep(.input-error input) {
    background: var(--red-200);
  }

  .examples {
    border: 1px solid var(--surface-50);
    padding: 0.5rem;
    border-radius: 6px;
    background-color: var(--surface-50);
  }
</style>

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { PropType } from 'vue';
  import {
    ObservationSchedule,
    RelativeEvent,
    Event,
    Frequency,
  } from '../../generated-sources/openapi';
  import Button from 'primevue/button';
  import { useI18n } from 'vue-i18n';
  import { isObjectEmpty } from '../../utils/commonUtils';
  import { ScheduleType } from '../../models/Scheduler';

  const { t, d } = useI18n();

  const props = defineProps({
    scheduler: {
      type: Object as PropType<ObservationSchedule>,
      required: true,
    },
    error: {
      type: String,
      default: '',
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    (e: 'openDialog', schedulerType: string): void;
    (e: 'removeScheduler'): void;
  }>();

  function getSchedulerDescription(): string {
    switch (props.scheduler.type) {
      case ScheduleType.Event:
        return t('scheduler.dialog.absoluteSchedule.description');
      case ScheduleType.RelativeEvent:
        return t('scheduler.dialog.relativeSchedule.description');
      default:
        return t('scheduler.dialog.description');
    }
  }

  function getDateValues(prop: string): string | undefined {
    switch (props.scheduler.type) {
      case ScheduleType.Event: {
        const schedule = props.scheduler as Event;
        switch (prop) {
          case 'dtstart': {
            return schedule.dtstart
              ? `${d(new Date(schedule.dtstart), 'long')}`
              : undefined;
          }
          case 'dtend':
            return schedule.dtend
              ? `${d(new Date(schedule.dtend), 'long')}`
              : undefined;
          default:
            return undefined;
        }
      }
      case ScheduleType.RelativeEvent: {
        const schedule = props.scheduler as RelativeEvent;
        switch (prop) {
          case 'dtstart': {
            return schedule.dtstart.offset?.value &&
              schedule.dtstart.offset?.unit
              ? `${t(
                  `scheduler.preview.unit.${schedule.dtstart.offset.unit}`,
                )} ${schedule.dtstart.offset.value}, ${schedule.dtstart.time}`
              : undefined;
          }
          case 'dtend':
            return schedule.dtend.offset?.value && schedule.dtend.offset?.unit
              ? `${t(`scheduler.preview.unit.${schedule.dtend.offset.unit}`)} ${
                  schedule.dtend.offset.value
                }, ${schedule.dtend.time} `
              : undefined;
          default:
            return undefined;
        }
      }
      default:
        return undefined;
    }
  }

  function getRepetitionValue(prop: string): string | undefined {
    switch (props.scheduler.type) {
      case ScheduleType.Event:
        {
          const schedule = props.scheduler as Event;
          switch (prop) {
            case 'every': {
              switch (schedule.rrule?.freq) {
                case Frequency.Hourly:
                  return t('scheduler.frequency.hour');
                case Frequency.Daily:
                  return t('scheduler.frequency.day');
                case Frequency.Weekly:
                  return t('scheduler.frequency.week');
                case Frequency.Monthly:
                  return t('scheduler.frequency.month');
                default:
                  return '';
              }
            }
            case 'weekdays': {
              let string = '';

              schedule.rrule?.byday
                ? schedule.rrule?.byday.forEach((item, index) => {
                    string += t(`scheduler.weekday.props.${item}`);

                    if (
                      schedule.rrule?.byday &&
                      index < schedule.rrule.byday.length - 1
                    ) {
                      string += ', ';
                    }
                  })
                : (string = '');

              return string;
            }
            case 'repetitionEnd': {
              if (schedule.rrule?.until) {
                return `${t('scheduler.preview.title.on')} ${d(new Date(schedule.rrule.until), 'short')}`;
              } else {
                const repetitionCount =
                  schedule.rrule?.byday &&
                  schedule.rrule.count &&
                  schedule.rrule.byday.length
                    ? schedule.rrule.count / schedule.rrule.byday.length
                    : schedule.rrule?.count;
                return schedule.rrule?.count
                  ? `${t('scheduler.preview.title.in')} ${repetitionCount} ${t(
                      `scheduler.preview.unit.${schedule.rrule.freq}`,
                    )}`
                  : t('scheduler.labels.event.repetitionEnd.studyEnd');
              }
            }
          }
        }
        break;
      case ScheduleType.RelativeEvent: {
        const schedule = props.scheduler as RelativeEvent;
        switch (prop) {
          case 'every':
            return schedule.rrrule?.frequency
              ? `${schedule.rrrule.frequency.value} ${t(
                  `scheduler.preview.unit.PL-${schedule.rrrule.frequency.unit}`,
                )}`
              : '';
          case 'repetitionEnd':
            return schedule.rrrule?.endAfter
              ? `${t(`scheduler.preview.title.on`)} ${t(
                  `scheduler.preview.unit.${schedule.rrrule.endAfter.unit}`,
                )} ${schedule.rrrule.endAfter.value} `
              : '';
          default:
            return '';
        }
      }
      default:
        return undefined;
    }
  }
</script>

<template>
  <div
    class="col-start-0 col-span-8 grid grid-cols-8"
    :class="{ 'scheduler-not-editable pb-4': !editable }"
  >
    <h5 class="col-start-0 col-span-8">{{ $t('scheduler.singular') }}*</h5>
    <div class="col-span-8 mb-3">{{ getSchedulerDescription() }}</div>
    <div
      v-if="isObjectEmpty(scheduler)"
      class="schedule-preview col-span-8 mb-2 px-6 py-4 italic"
    >
      {{ $t('scheduler.dialog.noSetScheduleDesc') }}
    </div>
    <h6 v-if="scheduler.type" class="color-primary col-span-8 my-1 font-medium">
      {{ $t(`scheduler.type.${scheduler.type}`) }}
    </h6>
    <div
      v-if="scheduler.type === ScheduleType.RelativeEvent"
      class="col-span-8 mb-3"
    >
      {{
        $t('scheduler.dialog.relativeSchedule.dayExplanation', {
          egLoginDate: $d(new Date('2023-12-01'), 'short'),
          egStartDate: $d(new Date('2023-12-02'), 'short'),
        })
      }}
    </div>

    <div
      v-if="scheduler.type"
      class="schedule-preview col-span-8 grid grid-cols-4 px-6 py-4"
      :class="
        scheduler.dtstart && getRepetitionValue('every') === ''
          ? 'grid-cols-2'
          : 'grid-cols-4'
      "
    >
      <div
        class="text-bold col-span-2 grid items-start"
        :class="
          scheduler.dtstart && getRepetitionValue('every') === ''
            ? 'col-span-2 grid-cols-2 border-r-2'
            : 'gird-cols-2 col-span-2 border-r-2'
        "
      >
        <div
          class="color-primary col-span-2 items-center border-b-2 py-3 pr-3 font-bold"
        >
          {{ $t('scheduler.preview.title.individualEvent') }}
        </div>
        <div class="col-span-1 py-2 font-medium">
          {{ $t('scheduler.preview.title.startsOn') }}
        </div>
        <div class="col-span-1 py-2">
          {{ getDateValues('dtstart') }}
        </div>
        <div class="col-span-1 py-2 font-medium">
          {{ $t('scheduler.preview.title.endsOn') }}
        </div>
        <div class="col-span-1 py-2">
          {{ getDateValues('dtend') }}
        </div>
        <div
          v-if="getRepetitionValue('weekdays')"
          class="col-span-2 py-2"
          style="height: 37px"
        />
      </div>

      <div
        v-if="getRepetitionValue('every') !== ''"
        class="text-bold col-span-2 grid"
      >
        <div class="color-primary col-span-2 border-b-2 py-3 pl-3 font-bold">
          {{ $t('scheduler.preview.title.repeatEvent') }}
        </div>
        <div class="col-span-1 py-2 pl-3 font-medium">
          {{ $t('scheduler.preview.title.every') }}
        </div>
        <div class="col-span-1 py-2">
          {{ getRepetitionValue('every') }}
        </div>

        <div
          v-if="getRepetitionValue('weekdays')"
          class="col-span-1 py-2 pl-3 font-medium"
        >
          {{ $t('scheduler.preview.title.selectedDays') }}
        </div>
        <div v-if="getRepetitionValue('weekdays')" class="col-span-1 py-2">
          {{ getRepetitionValue('weekdays') }}
        </div>

        <div class="col-span-1 py-2 pl-3 font-medium">
          {{ $t('scheduler.preview.title.ends') }}
        </div>
        <div class="col-span-1 py-2">
          {{ getRepetitionValue('repetitionEnd') }}
        </div>
      </div>
    </div>
    <div v-if="editable" class="col-span-8 mt-2 flex justify-end gap-1">
      <Button
        v-if="scheduler.type !== ScheduleType.RelativeEvent"
        class="justify-center"
        type="button"
        :disabeld="!editable"
        @click="emit('openDialog', 'absolute')"
        >{{
          scheduler.type
            ? $t('scheduler.labels.editScheduler')
            : $t('scheduler.labels.openScheduler')
        }}</Button
      >
      <Button
        v-if="scheduler.type !== ScheduleType.Event"
        class="p-button justify-center"
        type="button"
        :disabled="!editable"
        @click="emit('openDialog', 'relative')"
        >{{
          scheduler.type
            ? $t('scheduler.labels.editRelativeScheduler')
            : $t('scheduler.labels.openRelativeScheduler')
        }}</Button
      >
      <Button
        v-if="scheduler.dtstart"
        class="p-button btn-important justify-center"
        type="button"
        :disabled="!editable"
        @click="emit('removeScheduler')"
        >{{ $t('scheduler.labels.removeScheduler') }}</Button
      >
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .schedule-preview {
    border: 1px solid var(--surface-50);
    border-radius: 6px;
    background-color: var(--surface-50);
  }
</style>

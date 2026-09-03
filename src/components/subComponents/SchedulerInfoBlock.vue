/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import {
    Duration,
    Event,
    Frequency,
    Milestone,
    ObservationSchedule,
    RelativeEvent,
  } from '@gs/models';
  import Button from 'primevue/button';
  import { useI18n } from 'vue-i18n';
  import { isObjectEmpty } from '../../utils/commonUtils';
  import { ScheduleType } from '../../models/Scheduler';
  import { timeToHourMinuteString } from '../../utils/dateUtils';

  const { t, d } = useI18n();

  const {
    scheduler,
    error = undefined,
    editable = true,
    milestone = undefined,
  } = defineProps<{
    scheduler: ObservationSchedule;
    error?: string | undefined;
    editable?: boolean;
    milestone?: Milestone | undefined;
  }>();

  const emit = defineEmits<{
    (e: 'openDialog', schedulerType: string): void;
    (e: 'removeScheduler'): void;
  }>();

  function getSchedulerDescription(): string {
    switch (scheduler.type) {
      case ScheduleType.Event:
        return t('scheduler.dialog.absoluteSchedule.description');
      case ScheduleType.RelativeEvent:
        return t('scheduler.dialog.relativeSchedule.description');
      default:
        return t('scheduler.dialog.description');
    }
  }

  function getMilestoneOffsetLabel(offset?: Duration): string | undefined {
    if (!offset || offset.value === undefined || !offset.unit) {
      return undefined;
    }
    const unit = t(`scheduler.preview.unit.${offset.unit}`);
    if (offset.value === 0) {
      return t('scheduler.dialog.relativeSchedule.milestone.at');
    }
    return offset.value < 0
      ? t('scheduler.dialog.relativeSchedule.milestone.before', {
          value: Math.abs(offset.value),
          unit,
        })
      : t('scheduler.dialog.relativeSchedule.milestone.after', {
          value: offset.value,
          unit,
        });
  }

  function getDateValues(prop: string): string | undefined {
    switch (scheduler.type) {
      case ScheduleType.Event: {
        const schedule = scheduler as Event;
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
        const schedule = scheduler as RelativeEvent;
        if (milestone) {
          switch (prop) {
            case 'dtstart': {
              const offsetLabel = getMilestoneOffsetLabel(
                schedule.dtstart.offset,
              );
              return offsetLabel
                ? `${milestone.name} (${offsetLabel}), ${timeToHourMinuteString(schedule.dtstart.time)}`
                : undefined;
            }
            case 'dtend': {
              const offsetLabel = getMilestoneOffsetLabel(
                schedule.dtend.offset,
              );
              return offsetLabel
                ? `${milestone.name} (${offsetLabel}), ${timeToHourMinuteString(schedule.dtend.time)}`
                : undefined;
            }
            default:
              return undefined;
          }
        }
        switch (prop) {
          case 'dtstart': {
            return schedule.dtstart.offset?.value &&
              schedule.dtstart.offset?.unit
              ? `${t(
                  `scheduler.preview.unit.${schedule.dtstart.offset.unit}`,
                )} ${schedule.dtstart.offset.value}, ${timeToHourMinuteString(schedule.dtstart.time)}`
              : undefined;
          }
          case 'dtend':
            return schedule.dtend.offset?.value && schedule.dtend.offset?.unit
              ? `${t(`scheduler.preview.unit.${schedule.dtend.offset.unit}`)} ${
                  schedule.dtend.offset.value
                }, ${timeToHourMinuteString(schedule.dtend.time)} `
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
    switch (scheduler.type) {
      case ScheduleType.Event:
        {
          const schedule = scheduler as Event;
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

              if (schedule.rrule?.byday) {
                schedule.rrule.byday.forEach((item, index) => {
                  string += t(`scheduler.weekday.${item}`);

                  if (
                    schedule.rrule?.byday &&
                    index < schedule.rrule.byday.length - 1
                  ) {
                    string += ', ';
                  }
                });
              } else {
                string = '';
              }

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
        const schedule = scheduler as RelativeEvent;
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
    class="col-span-8 col-start-0 grid grid-cols-8"
    :class="{ 'scheduler-not-editable pb-4': !editable }"
  >
    <h5 class="col-span-8 col-start-0" :class="{ 'error-label': !!error }">
      {{ $t('scheduler.singular') }}*
    </h5>
    <div class="col-span-8 mb-3">{{ getSchedulerDescription() }}</div>
    <div v-if="error" class="error error-label col-span-8 mb-4">
      {{ error }}
    </div>
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
            ? 'col-span-2 grid-cols-2 border-r-2 border-gray-300'
            : 'gird-cols-2 col-span-2 border-r-2 border-gray-300'
        "
      >
        <div
          class="color-primary col-span-2 items-center border-b-2 border-gray-300 py-3 pr-3 font-bold"
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
        <div class="col-span-1 py-2 font-medium">
          {{ $t('scheduler.randomization.title') }}
        </div>
        <div class="col-span-1 py-2">
          {{
            !!scheduler.random?.state
              ? $t('scheduler.randomization.on')
              : $t('scheduler.randomization.off')
          }}
        </div>
        <div
          v-if="!!scheduler.random?.state"
          class="col-span-1 py-2 font-medium"
        >
          {{ $t('scheduler.randomization.duration') }}
        </div>
        <div v-if="!!scheduler.random?.state" class="col-span-1 py-2">
          {{ scheduler.random?.duration ?? 0 }}
        </div>
        <div
          v-if="getRepetitionValue('weekdays')"
          class="col-span-2 py-2"
          style="height: 37px"
        />
      </div>

      <div
        v-if="getRepetitionValue('every') !== ''"
        class="text-bold col-span-2 grid h-fit"
      >
        <div
          class="color-primary col-span-2 border-b-2 border-gray-300 py-3 pl-3 font-bold"
        >
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
        :label="
          scheduler.type
            ? $t('scheduler.labels.editScheduler')
            : $t('scheduler.labels.openScheduler')
        "
        :disabeld="!editable"
        @click="emit('openDialog', 'absolute')"
      />
      <Button
        v-if="scheduler.type !== ScheduleType.Event"
        class="p-button justify-center"
        type="button"
        :label="
          scheduler.type
            ? $t('scheduler.labels.editRelativeScheduler')
            : $t('scheduler.labels.openRelativeScheduler')
        "
        :disabled="!editable"
        @click="emit('openDialog', 'relative')"
      />
      <Button
        v-if="scheduler.dtstart"
        class="p-button btn-important justify-center"
        type="button"
        :label="$t('scheduler.labels.removeScheduler')"
        :disabled="!editable"
        @click="emit('removeScheduler')"
      />
    </div>
  </div>
</template>

<style scoped>
  .schedule-preview {
    border: 1px solid var(--surface-50);
    border-radius: 6px;
    background-color: var(--surface-50);
  }
</style>

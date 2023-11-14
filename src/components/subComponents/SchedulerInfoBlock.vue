/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 * Foerderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
<script setup lang="ts">
  import { PropType } from 'vue';
  import { Event, Frequency } from '../../generated-sources/openapi';
  import dayjs from 'dayjs';
  import Button from 'primevue/button';
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  defineProps({
    scheduler: {
      type: Object as PropType<Event>,
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
    (e: 'openDialog'): void;
    (e: 'removeScheduler'): void;
  }>();

  function getFrequencyLabel(frequency: Frequency) {
    switch (frequency) {
      case Frequency.Hourly:
        return t('scheduler.frequency.hours');
      case Frequency.Daily:
        return t('scheduler.frequency.days');
      case Frequency.Weekly:
        return t('scheduler.frequency.weeks');
      case Frequency.Monthly:
        return t('scheduler.frequency.months');
      case Frequency.Yearly:
        return t('scheduler.frequency.years');
    }
  }

  function getByMonthDayLabel(monthDay: number) {
    if (monthDay > 3 && monthDay < 21) return 'th';
    switch (monthDay % 10) {
      case 1:
        return t('scheduler.byMonthDayLabel.first');
      case 2:
        return t('scheduler.byMonthDayLabel.second');
      case 3:
        return t('scheduler.byMonthDayLabel.third');
      default:
        return t('scheduler.byMonthDayLabel.fourth');
    }
  }

  function getMonthLabel(month: number) {
    switch (month) {
      case 1:
        return t('scheduler.months.january');
      case 2:
        return t('scheduler.months.february');
      case 3:
        return t('scheduler.months.march');
      case 4:
        return t('scheduler.months.april');
      case 5:
        return t('scheduler.months.mai');
      case 6:
        return t('scheduler.months.june');
      case 7:
        return t('scheduler.months.july');
      case 8:
        return t('scheduler.months.august');
      case 9:
        return t('scheduler.months.september');
      case 10:
        return t('scheduler.months.october');
      case 11:
        return t('scheduler.months.november');
      case 12:
        return t('scheduler.months.december');
    }
  }

  function getByStepPosLabel(setPos: number) {
    switch (setPos) {
      case 1:
        return t('scheduler.bySetPosLabel.first');
      case 2:
        return t('scheduler.bySetPosLabel.second');
      case 3:
        return t('scheduler.bySetPosLabel.third');
      case 4:
        return t('scheduler.bySetPosLabel.fourth');
      case -1:
        return t('scheduler.bySetPosLabel.last');
    }
  }
</script>

<template>
  <div
    class="col-start-0 col-span-8 grid grid-cols-8"
    :class="editable ? '' : 'scheduler-not-editable pb-4'"
  >
    <h5 class="col-start-0 col-span-8">{{ $t('scheduler.singular') }}*</h5>
    <div
      class="col-start-0 col-span-8 grid grid-cols-7 items-start justify-start gap-4"
    >
      <div
        class="scheduler-info col-span-5"
        :class="editable ? '' : 'border-disabled  col-span-7 mt-2'"
      >
        <div v-if="scheduler.dtstart" class="grid grid-cols-2 gap-x-4 gap-y-1">
          <div v-if="scheduler.dtstart === scheduler.dtend" class="mt-2">
            <div>
              <span class="mr-1 font-bold"
                >{{ $t('scheduler.labels.date') }}:</span
              >
              {{ dayjs(scheduler.dtstart).format('DD/MM/YYYY') }}
            </div>
            <div>
              <span class="font-bold">{{
                $t('scheduler.labels.timeframe')
              }}</span>
              {{ dayjs(scheduler.dtstart).format('HH:mm') }} -
              {{ dayjs(scheduler.dtend).format('HH:mm') }}
            </div>
          </div>
          <div v-else class="mt-2">
            <div class="mb-0.5 font-bold">
              {{ $t('scheduler.labels.timeframe') }}
            </div>
            <span class="font-medium">{{ $t('global.labels.start') }}: </span>
            <span>
              {{ dayjs(scheduler.dtstart).format('DD/MM/YYYY, HH:mm') }}</span
            >
            <div>
              <span class="font-medium">{{ $t('global.labels.end') }}: </span
              >{{ dayjs(scheduler.dtend).format('DD/MM/YYYY, HH:mm') }}
            </div>
          </div>

          <div
            v-if="scheduler.rrule && scheduler.rrule.freq"
            class="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1"
          >
            <div class="col-span-2 mt-3 font-bold">
              {{ $t('scheduler.labels.repeat') }}
            </div>
            <div>
              <span class="font-medium"
                >{{ $t('scheduler.labels.frequency') }}:
              </span>
              {{ scheduler.rrule.freq }}
            </div>
            <div v-if="scheduler?.rrule?.interval">
              For {{ scheduler.rrule.interval }}
              {{ getFrequencyLabel(scheduler.rrule.freq) }}
            </div>
            <div
              v-if="
                scheduler.rrule.bymonthday &&
                scheduler.rrule.freq === Frequency.Monthly
              "
              class="col-span-1 col-start-2"
            >
              Every {{ scheduler.rrule.bymonthday
              }}{{ getByMonthDayLabel(scheduler.rrule.bymonthday) }}
            </div>

            <div
              v-if="
                scheduler.rrule.bysetpos &&
                scheduler.rrule.freq === Frequency.Monthly
              "
              class="col-span-1 col-start-2"
            >
              Every {{ getByStepPosLabel(scheduler.rrule.bysetpos) }}
              <span
                v-for="(day, index) in scheduler.rrule.byday"
                :key="index"
                class="day mr-2"
                >{{ day }}</span
              >
            </div>

            <div
              v-if="scheduler.rrule.freq === Frequency.Yearly"
              class="col-span-1 col-start-2"
            >
              {{ $t('scheduler.labels.every') }}
              <span v-if="scheduler.rrule.bymonthday"
                >{{ scheduler.rrule.bymonthday
                }}{{ getByMonthDayLabel(scheduler.rrule.bymonthday) }}</span
              >
              <span v-if="scheduler.rrule.byday"
                ><span
                  v-for="(day, index) in scheduler.rrule.byday"
                  :key="index"
                  class="day"
                  >{{ day }}</span
                >
                in
              </span>
              <span v-if="scheduler.rrule.bymonth">
                {{ getMonthLabel(scheduler.rrule.bymonth) }}
              </span>
            </div>
          </div>
          <div
            v-if="
              scheduler.rrule &&
              scheduler.rrule.byday?.length &&
              !scheduler.rrule.bysetpos
            "
            class="col-span-2"
          >
            <span class="font-medium"
              >{{ $t('scheduler.labels.selection.daysSelected') }}:
            </span>
            <span
              v-for="(day, index) in scheduler.rrule.byday"
              :key="index"
              class="day mr-1"
            >
              {{ day }}
            </span>
          </div>

          <div
            v-if="scheduler.rrule && scheduler.rrule.count"
            class="col-span-2"
          >
            <span class="font-medium"
              >{{ $t('scheduler.labels.repetitionEnd') }}:</span
            >
            <span class="mx-1">{{ $t('scheduler.labels.after') }}</span>
            <span v-if="scheduler.rrule?.byday?.length">
              {{ scheduler.rrule.count / scheduler.rrule.byday.length }}</span
            >
            <span v-else> {{ scheduler.rrule.count }}</span>
            <span v-if="scheduler.rrule.freq" class="ml-1">
              {{ getFrequencyLabel(scheduler.rrule.freq) }}
            </span>
          </div>
          <div
            v-if="scheduler.rrule && scheduler.rrule.until"
            class="col-span-2"
          >
            <span class="font-medium"
              >{{ $t('scheduler.labels.repetitionEnd') }}: </span
            >{{ $t('scheduler.labels.on') }}
            {{ dayjs(scheduler.rrule.until).format('DD/MM/YYYY, HH:mm') }}
          </div>
        </div>
        <div v-else class="text-gray-400">
          <div v-if="error" class="error mb-4">
            {{ error }}
          </div>

          <span v-else>{{
            $t('observation.placeholder.emptySchedulerMsg')
          }}</span>
        </div>
      </div>
      <div v-if="editable" class="col-span-2 grid grid-cols-1 gap-1">
        <Button
          class="justify-center"
          type="button"
          :disabeld="!editable"
          @click="emit('openDialog')"
          >{{ $t('scheduler.labels.openScheduler') }}</Button
        >
        <Button
          v-if="scheduler.dtstart"
          class="justify-center"
          type="button"
          :disabled="!editable"
          @click="emit('removeScheduler')"
          >{{ $t('scheduler.labels.removeScheduler') }}</Button
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>

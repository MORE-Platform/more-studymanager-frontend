/* * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more *
contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute * for
Digital Health and Prevention -- A research institute of the * Ludwig Boltzmann
Gesellschaft, Oesterreichische Vereinigung zur * Foerderung der
wissenschaftlichen Forschung). * Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import SelectButton from 'primevue/selectbutton';
  import Checkbox from 'primevue/checkbox';
  import { Frequency, Weekday, Event } from '../../generated-sources/openapi';
  import { Nullable } from 'vitest';
  import { useI18n } from 'vue-i18n';
  import { useStudyStore } from '../../stores/studyStore';
  import { dateToDateTimeString } from '../../utils/dateUtils';

  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');

  const studyStore = useStudyStore();

  const scheduler: any = dialogRef.value.data.scheduler;

  const repetitionEndArray = [
    {
      label: t('scheduler.labels.event.repetitionEnd.studyEnd'),
      value: 'onDate',
      active: true,
      unit: 'onDate',
    },
    {
      label: t('scheduler.labels.event.repetitionEnd.after'),
      value: 'after',
      active: true,
      unit: 'after',
    },
  ];

  const repeatFreqArray = [
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
    //{label: 'Monthly', value: Frequency.Monthly, active: true, unit: 'month(s)'}
  ];
  const repeatWeekdayArray = [
    { label: t('scheduler.weekday.short.monday'), value: Weekday.Mo },
    { label: t('scheduler.weekday.short.tuesday'), value: Weekday.Tu },
    { label: t('scheduler.weekday.short.wednesday'), value: Weekday.We },
    { label: t('scheduler.weekday.short.thursday'), value: Weekday.Th },
    { label: t('scheduler.weekday.short.friday'), value: Weekday.Fr },
    { label: t('scheduler.weekday.short.saturday'), value: Weekday.Sa },
    { label: t('scheduler.weekday.short.sunday'), value: Weekday.Su },
  ];
  const repeatYearOptionArray = [
    { label: t('scheduler.labels.selection.specificDay'), value: 'onSpecific' },
    //{label: 'On specific options', value: 'onOptions'}
  ];
  const repeatBySetPosOptionArray = [
    { label: t('scheduler.bySetPosLabel.first'), value: 1 },
    { label: t('scheduler.bySetPosLabel.second'), value: 2 },
    { label: t('scheduler.bySetPosLabel.third'), value: 3 },
    { label: t('scheduler.bySetPosLabel.fourth'), value: 4 },
    { label: t('scheduler.bySetPosLabel.last'), value: -1 },
  ];
  const repeatByMonthOptionArray = [
    { label: t('scheduler.months.short.january'), value: 1 },
    { label: t('scheduler.months.short.january'), value: 2 },
    { label: t('scheduler.months.short.january'), value: 3 },
    { label: t('scheduler.months.short.january'), value: 4 },
    { label: t('scheduler.months.short.january'), value: 5 },
    { label: t('scheduler.months.short.january'), value: 6 },
    { label: t('scheduler.months.short.january'), value: 7 },
    { label: t('scheduler.months.short.january'), value: 8 },
    { label: t('scheduler.months.short.january'), value: 9 },
    { label: t('scheduler.months.short.january'), value: 10 },
    { label: t('scheduler.months.short.january'), value: 11 },
    { label: t('scheduler.months.short.january'), value: 12 },
  ];
  const repeatByDayForYearArray = [
    { label: t('scheduler.weekday.monday'), value: [Weekday.Mo] },
    { label: t('scheduler.weekday.tuesday'), value: [Weekday.Tu] },
    { label: t('scheduler.weekday.wednesday'), value: [Weekday.We] },
    { label: t('scheduler.weekday.thursday'), value: [Weekday.Th] },
    { label: t('scheduler.weekday.friday'), value: [Weekday.Fr] },
    { label: t('scheduler.weekday.saturday'), value: [Weekday.Sa] },
    { label: t('scheduler.weekday.sunday'), value: [Weekday.Su] },
    {
      label: t('scheduler.labels.selection.allDaysInWeek'),
      value: [
        Weekday.Mo,
        Weekday.Tu,
        Weekday.We,
        Weekday.Th,
        Weekday.Fr,
        Weekday.Sa,
        Weekday.Su,
      ],
    },
    {
      label: t('scheduler.labels.selection.allWeekdays'),
      value: [Weekday.Mo, Weekday.Tu, Weekday.We, Weekday.Th, Weekday.Fr],
    },
    {
      label: t('scheduler.labels.selection.allWeekendDays'),
      value: [Weekday.Sa, Weekday.Su],
    },
  ];

  const minDate: Date = new Date(studyStore.study.plannedStart as string);
  minDate.setHours(0, 0, 0);
  const maxDate: Date = new Date(studyStore.study.plannedEnd as string);
  maxDate.setHours(23, 59, 59);

  const start: Ref<Date> = ref(
    scheduler.dtstart ? new Date(scheduler.dtstart) : new Date()
  );
  const end: Ref<Date> = ref(
    scheduler.dtend ? new Date(scheduler.dtend) : new Date()
  );

  const formerStart: Ref<Date> = ref(start.value);
  const formerEnd: Ref<Date> = ref(end.value);

  const allDayChecked: Ref<boolean> = ref(false);
  const oneDayObservationChecked: Ref<boolean> = ref(true);
  const repeatChecked: Ref<boolean> = ref(false);

  if (
    scheduler?.dtstart &&
    scheduler?.dtend &&
    dateToDateTimeString(new Date(scheduler?.dtstart))?.substring(11, 16) ===
      '00:00' &&
    dateToDateTimeString(new Date(scheduler?.dtend))?.substring(11, 16) ===
      '23:59'
  ) {
    allDayChecked.value = true;
  }

  if (scheduler && scheduler.dtstart && scheduler.dtend) {
    if (
      dateToDateTimeString(new Date(scheduler?.dtstart))
        ?.toString()
        .substring(0, 10) !==
      dateToDateTimeString(new Date(scheduler?.dtend))
        ?.toString()
        .substring(0, 10)
    ) {
      oneDayObservationChecked.value = false;
    } else if (
      dateToDateTimeString(new Date(scheduler?.dtstart))
        ?.toString()
        .substring(0, 10) ===
      dateToDateTimeString(new Date(scheduler?.dtend))
        ?.toString()
        .substring(0, 10)
    ) {
      oneDayObservationChecked.value = true;
    }
  }

  const repeatFreq: Ref<Frequency | undefined> = ref(
    scheduler.rrule && scheduler.rrule.freq ? scheduler.rrule.freq : undefined
  );
  const repeatInterval: Ref<number | undefined> = ref(
    scheduler.rrule && scheduler.rrule.interval
      ? scheduler.rrule.interval
      : undefined
  ); // hourly/daily/weekly/monthly/yearly
  const repeatCount: Ref<Nullable<string>> = ref(
    scheduler.rrule && scheduler.rrule.count ? scheduler.rrule.count : undefined
  );
  // kein repeatUntil wenn repeatCount // hourly/daily/weekly/monthly/yearly
  const repeatUntil: Ref<Date | undefined> = ref(
    scheduler.rrule && scheduler.rrule.until
      ? new Date(scheduler.rrule.until)
      : undefined
  ); // kein repeatCount wenn repeatUntil //hourly/daily/weekly/monthly/yearly
  const repeatByDay: Ref<Weekday[] | undefined> = ref(
    scheduler.rrule && scheduler.rrule.byday ? scheduler.rrule.byday : undefined
  ); // weekly/monthly/yearly
  const repeatByMonth: Ref<number | undefined> = ref(
    scheduler.rrule && scheduler.rrule.bymonth
      ? scheduler.rrule.bymonth
      : undefined
  ); // monthly/yearly
  const repeatByMonthDay: Ref<Nullable<string>> = ref(
    scheduler.rrule && scheduler.rrule.bymonthday
      ? scheduler.rrule.bymonthday
      : undefined
  ); // yearly
  const repeatBySetPos: Ref<number | undefined> = ref(
    scheduler.rrule && scheduler.rrule.bysetpos
      ? scheduler.rrule.bysetpos
      : undefined
  ); // monthly/yearly

  const repeatCountLabel: Ref<string | undefined> = ref(
    scheduler.rrule && scheduler.rrule.freq
      ? repeatFreqArray.find((f: any) => f.value === scheduler.rrule.freq)?.unit
      : ''
  );
  const repeatYearOption: Ref<string> = ref('onSpecific');
  const repeatEndOption: Ref<string> = ref('never');
  //const intervalError: Ref<string> = ref('')

  if (repeatFreq.value) {
    repeatChecked.value = true;
  }

  if (repeatCount.value && repeatByDay.value?.length) {
    repeatCount.value = (
      parseInt(repeatCount.value) / repeatByDay.value?.length || 1
    ).toString();
  }

  if (repeatCount.value || repeatUntil.value) {
    if (repeatCount.value) {
      repeatEndOption.value = 'after';
    }
    if (repeatUntil.value) {
      repeatEndOption.value = 'onDate';
    }
  }

  if (scheduler && scheduler.rrule) {
    if (
      scheduler.rrule.bymonthday ||
      scheduler.rrule.bysetpos ||
      scheduler.rrule.byday
    ) {
      if (scheduler.rrule.bymonthday) {
        repeatYearOption.value = 'onSpecific';
      }
      if (scheduler.rrule.bysetpos && scheduler.rrule.byday) {
        repeatYearOption.value = 'onOptions';
      }
    }
  }

  function setRepeatCountLabel(repeatFreq: string | undefined) {
    if (repeatFreq) {
      repeatCountLabel.value = repeatFreqArray.find(
        (f: any) => f.value === repeatFreq
      )?.unit;
    } else {
      return '';
    }
  }

  function setRepetitionEnd(repeatEnd: string | undefined) {
    if (repeatEnd) {
      const repeatValue = repetitionEndArray.find(
        (f: any) => f.value === repeatEnd
      )?.unit;
      if (repeatValue === 'onDate') {
        repeatCount.value = undefined;
        const date = new Date(studyStore.study.plannedEnd as string);
        date.setHours(23, 59, 59);
        repeatUntil.value = date;
      } else if (repeatValue === 'after') {
        repeatUntil.value = undefined;
        repeatEndOption.value = repeatValue ? repeatValue : 'never';
      } else {
        repeatEndOption.value = 'never';
        repeatUntil.value = undefined;
        repeatCount.value = undefined;
      }
    }
  }

  function resetYearlyInterval() {
    repeatBySetPos.value = undefined;
    repeatByMonth.value = undefined;
    repeatByDay.value = undefined;
    repeatByMonthDay.value = undefined;
    repeatUntil.value = undefined;
  }
  function resetRepeatEndOptions() {
    repeatUntil.value = undefined;
    repeatCount.value = undefined;
  }
  function resetRepeatFreqOptions() {
    repeatInterval.value = undefined;
    repeatEndOption.value = 'never';
    resetYearlyInterval();
    resetRepeatEndOptions();
  }

  function changeOneDayObservation() {
    if (oneDayObservationChecked.value) {
      if (start.value.getDate() !== end.value.getDate()) {
        end.value = start.value;
        end.value.setHours(
          formerEnd.value.getHours(),
          formerEnd.value.getMinutes(),
          formerEnd.value.getSeconds()
        );
        formerEnd.value = end.value;
      }
    } else if (!oneDayObservationChecked.value) {
      repeatChecked.value = false;
      resetRepeatOptions();
      resetRepeatEndOptions();
      resetRepeatFreqOptions();
    }
  }

  function changeAllDayChecked() {
    start.value.setHours(0, 0, 0);
    formerStart.value = start.value;
    end.value.setHours(23, 59, 59);
    formerEnd.value = end.value;
  }

  const calendarInfo: Ref<string> = ref('');

  function validateTime(dateType: string, dateTimeCheck?: boolean) {
    if (dateType === 'start' && start.value > end.value) {
      end.value = start.value;
      formerStart.value = start.value;
      formerEnd.value = start.value;
      calendarInfo.value = t('scheduler.info.timeOverlapStart');
      highlightElement('end-date');
    } else if (dateType === 'end' && end.value < start.value) {
      start.value = end.value;
      formerStart.value = end.value;
      formerEnd.value = end.value;
      calendarInfo.value = t('scheduler.info.timeOverlapEnd');
      highlightElement('start-time');
    }

    if (typeof dateTimeCheck === 'undefined') {
      formerEnd.value.setHours(
        end.value.getHours(),
        end.value.getMinutes(),
        end.value.getSeconds()
      );
      end.value = formerEnd.value;
    } else if (dateTimeCheck && dateType === 'end') {
      formerEnd.value = end.value;
    }
  }

  function validateDate(dateType: string) {
    if (dateType === 'start') {
      start.value.setHours(
        formerStart.value.getHours(),
        formerStart.value.getMinutes(),
        formerStart.value.getSeconds()
      );
      if (start.value < minDate || start.value > maxDate) {
        start.value = formerStart.value;
        if (!oneDayObservationChecked.value) {
          calendarInfo.value = t('scheduler.info.startDateNotWithinRange');
        } else {
          formerStart.value = start.value;
        }
        highlightElement('start-date');
      } else if (start.value.getDate() > end.value.getDate()) {
        end.value = start.value;
        formerStart.value = start.value;
        formerEnd.value = end.value;
        if (!oneDayObservationChecked.value) {
          calendarInfo.value = t('scheduler.info.dateOverlapStart');
        }
        highlightElement('end-date');
      }
    } else if (dateType === 'end') {
      end.value.setHours(
        formerEnd.value.getHours(),
        formerEnd.value.getMinutes(),
        formerEnd.value.getMinutes()
      );
      if (end.value < minDate || end.value > maxDate) {
        end.value = formerEnd.value;
        validateTime('end', true);
        calendarInfo.value = t('scheduler.info.endDateNotWithinRange');
        highlightElement('end-date');
      } else if (end.value.getDate() < start.value.getDate()) {
        end.value = start.value;
        end.value.setHours(
          formerEnd.value.getHours(),
          formerEnd.value.getMinutes(),
          formerEnd.value.getSeconds()
        );
        formerEnd.value = start.value;
        validateTime('end', true);
        calendarInfo.value = t('scheduler.info.dateOverlapEnd');
        highlightElement('start-date');
      } else {
        formerEnd.value = end.value;
        validateTime('end', true);
      }
    } else {
      calendarInfo.value = '';
      calendarInputErrors.value.start = '';
      calendarInputErrors.value.end = '';
    }
  }

  function highlightElement(elClass: string) {
    const items = document.getElementsByClassName(elClass);
    setTimeout(() => {
      for (const el of items) {
        el.classList.add('highlight');
      }
    }, 200);

    setTimeout(() => {
      for (const el of items) {
        el.classList.remove('highlight');
      }
    }, 1000);
  }

  function repeatCheckedData() {
    if (!repeatChecked.value) {
      resetRepeatOptions();
    }
  }

  function hasDateRangeError() {
    const e1 = checkStartDateError(start.value);
    const e2 = checkEndDateError(end.value);
    return e1 || e2;
  }

  function save() {
    if (hasDateRangeError()) {
      return;
    }

    const s = start.value;
    const e = end.value;

    s.setMilliseconds(0);
    s.setSeconds(0);
    e.setMilliseconds(0);
    e.setSeconds(0);

    if (allDayChecked.value) {
      s.setHours(0, 0, 0);
      e.setHours(23, 59, 59);
    }

    if (repeatCount.value && repeatByDay.value?.length) {
      repeatCount.value = (
        parseInt(repeatCount.value) * repeatByDay.value?.length
      ).toString();
    }
    if (!calendarInputErrors.value.start && !calendarInputErrors.value.end) {
      try {
        const returnEvent: Event = {
          dtstart: s.toISOString(),
          dtend: e.toISOString(),
          rrule: undefined,
        };

        if (repeatFreq.value) {
          returnEvent.rrule = {
            freq: repeatFreq.value,
            until: repeatUntil.value
              ? repeatUntil.value?.toISOString()
              : undefined,
            count: repeatCount.value ? parseInt(repeatCount.value) : undefined,
            interval: repeatInterval.value,
            byday: repeatByDay.value,
            bymonth: repeatByMonth.value,
            bymonthday: repeatByMonthDay.value
              ? parseInt(repeatByMonthDay.value)
              : undefined,
            bysetpos: repeatBySetPos.value,
          };
          if (
            !returnEvent.rrule.count &&
            !returnEvent.rrule.until &&
            studyStore.study.plannedEnd
          ) {
            const endDate: Date = new Date(studyStore.study.plannedEnd);
            endDate.setHours(23, 59, 59);
            returnEvent.rrule.until = endDate.toISOString();
          }
        }
        dialogRef.value.close(returnEvent);
      } catch (e) {
        console.error('Cannot send schedule event ', e);
      }
    }
  }

  function cancel() {
    dialogRef.value.close();
  }

  function resetRepeatOptions() {
    repeatBySetPos.value = undefined;
    repeatByMonth.value = undefined;
    repeatByDay.value = undefined;
    repeatByMonthDay.value = undefined;
    repeatUntil.value = undefined;
    repeatCount.value = undefined;
    repeatInterval.value = undefined;
    repeatEndOption.value = 'never';
    repeatCountLabel.value = undefined;
    repeatFreq.value = undefined;
  }

  const calendarInputErrors: Ref<any> = ref({
    start: '',
    end: '',
  });

  function checkEndDateError(endDate: Date): boolean {
    if (endDate < minDate || endDate > maxDate) {
      calendarInputErrors.value.end =
        'Please enter a end date-time that lies inside the study range and is not in the past.';
      return true;
    } else {
      calendarInputErrors.value.end = '';
      return false;
    }
  }

  function checkStartDateError(startDate: Date): boolean {
    if (startDate < minDate || startDate > maxDate) {
      calendarInputErrors.value.start =
        'Please enter a start date-time that lies inside the study range.';
      return true;
    } else {
      calendarInputErrors.value.start = '';
      return false;
    }
  }
</script>

<template>
  <div class="scheduler relative">
    <div class="grid grid-cols-6 items-center gap-4">
      <h6 class="col-span-6">{{ $t('scheduler.labels.event.setDates') }}</h6>
      <div class="col-span-6 mb-1">
        {{ $t('scheduler.labels.event.setDatesDesc') }}
      </div>
      <div class="col-span-6 mb-4">
        <h5 class="text-color mb-1 font-bold">
          {{ $t('cronSchedule.example.title') }}
        </h5>
        <div class="examples">
          <div class="mb-1.5">
            <div class="color-primary font-medium">
              {{ $t('scheduler.labels.event.example.titles.singleDay') }}
            </div>
            <div>
              <!-- eslint-disable vue/no-v-html -->
              <span
                v-html="$t('scheduler.labels.event.example.values.singleDay')"
              />
            </div>
          </div>
          <div class="mb-1.5">
            <div class="color-primary font-medium">
              {{ $t('scheduler.labels.event.example.titles.series') }}
            </div>
            <div>
              <!-- eslint-disable vue/no-v-html -->
              <span
                v-html="$t('scheduler.labels.event.example.values.series')"
              />
            </div>
          </div>
          <div class="mb-1.5">
            <div class="color-primary font-medium">
              {{ $t('scheduler.labels.event.example.titles.fullTimespan') }}
            </div>
            <div>
              <!-- eslint-disable vue/no-v-html -->
              <span
                v-html="
                  $t('scheduler.labels.event.example.values.fullTimespan')
                "
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="!oneDayObservationChecked" class="col-span-5 font-bold">
        {{ $t('scheduler.labels.timeframe') }}
      </div>
      <div class="col-span-1 col-start-1 font-bold">
        <span v-if="oneDayObservationChecked">{{
          $t('scheduler.labels.timeframe')
        }}</span>
        <span v-else>{{ $t('global.labels.start') }}</span>
      </div>
      <Calendar
        v-model="start"
        date-format="dd/mm/yy"
        :placeholder="'dd/mm/yyyy'"
        :min-date="minDate"
        :max-date="maxDate"
        autocomplete="off"
        style="width: 100%"
        class="start-date col-span-2 col-start-2"
        :class="calendarInputErrors.start ? 'input-error' : ''"
        @date-select="validateDate('start')"
        @blur="validateDate('start')"
      />
      <Calendar
        v-if="!allDayChecked"
        v-model="start"
        :placeholder="'hh:mm'"
        class="p-calendar-timeonly start-date start-time col-span-1"
        time-only
        @blur="validateTime('start')"
      />
      <div v-if="oneDayObservationChecked && !allDayChecked" class="col-span-2">
        <span class="ml-1 mr-4">-</span>
        <Calendar
          v-model="end"
          :placeholder="'hh:mm'"
          class="p-calendar-timeonly end-date end-time col-span-1"
          time-only
          @blur="validateTime('end')"
        />
      </div>

      <div
        v-if="calendarInputErrors.start"
        class="error col-span-5 col-start-2"
      >
        {{ calendarInputErrors.start }}
      </div>
      <div
        v-if="!oneDayObservationChecked"
        class="col-span-1 col-start-1 font-bold"
      >
        {{ $t('global.labels.end') }}
      </div>
      <Calendar
        v-if="!oneDayObservationChecked"
        v-model="end"
        date-format="dd/mm/yy"
        :placeholder="'dd/mm/yyyy'"
        :min-date="start > minDate ? start : minDate"
        :max-date="maxDate"
        autocomplete="off"
        style="width: 100%"
        class="end-date col-span-2 col-start-2"
        :class="calendarInputErrors.end ? 'input-error' : ''"
        @date-select="validateDate('end')"
        @blur="validateDate('end')"
      />
      <Calendar
        v-if="!allDayChecked && !oneDayObservationChecked"
        v-model="end"
        :placeholder="'hh:mm'"
        class="p-calendar-timeonly end-date end-time col-span-1"
        time-only
        @blur="validateTime('end')"
      />
      <div v-if="calendarInfo" class="col-span-5 col-start-2">
        <span class="pi pi-info-circle color-primary mr-2" />{{ calendarInfo }}
      </div>
      <div v-if="calendarInputErrors.end" class="error col-span-5 col-start-2">
        {{ calendarInputErrors.end }}
      </div>

      <div class="col-span-2 col-start-2">
        {{ $t('scheduler.labels.event.oneDayObservation') }}:
        <Checkbox
          v-model="oneDayObservationChecked"
          class="ml-2"
          :binary="true"
          @change="changeOneDayObservation()"
        />
      </div>

      <div class="col-span-2">
        <span>{{ $t('scheduler.labels.event.allDay') }}</span>
        <Checkbox
          v-model="allDayChecked"
          class="ml-2"
          :binary="true"
          @change="changeAllDayChecked()"
        />
      </div>

      <div
        v-if="oneDayObservationChecked"
        class="col-span-6 col-start-1 grid grid-cols-6 gap-4"
      >
        <hr class="col-start-0 col-span-6 mb-4 mt-4" />
        <h6 class="col-span-6">{{ $t('scheduler.labels.event.repeat') }}</h6>
        <div class="col-span-6 mb-2">
          {{ $t('scheduler.labels.event.repeatDesc') }}
        </div>
        <div class="col-span-6 mt-4 grid grid-cols-6 items-center gap-4">
          <div class="col-span-1">
            {{ $t('scheduler.labels.repeat') }}:
            <Checkbox
              v-model="repeatChecked"
              class="ml-2"
              :binary="true"
              @change="repeatCheckedData()"
            />
          </div>
          <!-- Frequency: never to yearly -->
          <div
            v-if="repeatChecked"
            class="col-span-5 col-start-2 grid grid-cols-5 gap-4"
          >
            <SelectButton
              v-model="repeatFreq"
              :options="repeatFreqArray"
              option-label="label"
              option-value="value"
              class="col-span-5 w-full"
              @click="setRepeatCountLabel(repeatFreq)"
              @change="resetRepeatFreqOptions"
            />
          </div>

          <!-- weekday select -->
          <div
            v-if="repeatChecked && repeatFreq === Frequency.Weekly"
            class="col-span-5 col-start-2 grid grid-cols-5 gap-4"
          >
            <SelectButton
              v-model="repeatByDay"
              :options="repeatWeekdayArray"
              option-label="label"
              option-value="value"
              class="col-span-5 w-full"
              :multiple="true"
            ></SelectButton>
          </div>

          <!-- monthly/yearly select -->
          <div
            v-if="
              (repeatChecked && repeatFreq === Frequency.Yearly) ||
              (repeatChecked && repeatFreq === Frequency.Monthly)
            "
            class="col-span-5 col-start-2 grid grid-cols-5 gap-4"
          >
            <Dropdown
              v-model="repeatYearOption"
              :options="repeatYearOptionArray"
              :option-label="'label'"
              :option-value="'value'"
              class="col-span-3"
              @change="resetYearlyInterval()"
            >
            </Dropdown>

            <div
              v-if="repeatYearOption === repeatYearOptionArray[0].value"
              class="col-start-0 col-span-5 grid grid-cols-3 items-center gap-4"
            >
              <Dropdown
                v-if="repeatFreq === Frequency.Yearly"
                v-model="repeatByMonth"
                :options="repeatByMonthOptionArray"
                :option-label="'label'"
                :option-value="'value'"
                :placeholder="$t('scheduler.placeholder.chooseMonth')"
              />
              <InputText
                v-model="repeatByMonthDay"
                :placeholder="$t('scheduler.placeholder.enterDayOfMonth')"
              />
            </div>
            <div
              v-if="repeatYearOption === repeatYearOptionArray[1].value"
              class="col-start-0 col-span-5 grid grid-cols-3 gap-4"
            >
              <Dropdown
                v-model="repeatBySetPos"
                :options="repeatBySetPosOptionArray"
                :option-label="'label'"
                :option-value="'value'"
                :placeholder="$t('scheduler.placeholder.chooseGeneralInterval')"
              />
              <Dropdown
                v-model="repeatByDay"
                :options="repeatByDayForYearArray"
                :option-label="'label'"
                :option-value="'value'"
                :placeholder="$t('scheduler.placeholder.chooseDayInterval')"
              />
              <Dropdown
                v-if="repeatFreq === Frequency.Yearly"
                v-model="repeatByMonth"
                :options="repeatByMonthOptionArray"
                :option-label="'label'"
                :option-value="'value'"
                :placeholder="$t('scheduler.placeholder.chooseMonth')"
              />
            </div>
          </div>

          <hr
            v-if="repeatFreq === Frequency.Weekly"
            class="col-start-0 col-span-6 mb-4 mt-4"
          />
          <div
            v-if="repeatChecked && repeatFreq"
            class="col-start-0 col-span-1 self-center font-medium"
          >
            {{ $t('scheduler.labels.repetitionEnd') }}
          </div>
          <div
            v-if="repeatChecked && repeatFreq"
            class="col-span-5 col-start-2 gap-4"
          >
            <SelectButton
              v-model="repeatEndOption"
              :options="repetitionEndArray"
              option-label="label"
              option-value="value"
              class="mr-4 inline w-full"
              @click="setRepetitionEnd(repeatEndOption)"
            ></SelectButton>
            <div v-if="repeatEndOption === 'after'" class="inline">
              <InputText
                v-model="repeatCount"
                type="text"
                :placeholder="$t('scheduler.placeholder.enterRepeatCount')"
              />
              <span class="ml-2">{{ repeatCountLabel }}</span>
            </div>
            <div v-else-if="repeatEndOption === 'onDate'" class="col-span-2">
              <Calendar
                v-show="false"
                v-model="repeatUntil"
                placeholder="dd/mm/yyyy"
                date-format="dd/mm/yy"
                autocomplete="off"
                style="width: 100%"
                :class="'col-span-5'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="height: 100px"></div>
    <div class="pos-bottom grid w-full grid-cols-6">
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

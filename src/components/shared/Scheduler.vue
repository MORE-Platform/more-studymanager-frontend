<script setup lang="ts">
  import { inject, onUpdated, ref, Ref } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import SelectButton from 'primevue/selectbutton';
  import Checkbox from 'primevue/checkbox';
  import { Frequency, Weekday, Event } from '../../generated-sources/openapi';
  import { MoreTableEditableChoicePropertyValues } from '../../models/MoreTableModel';
  import { Nullable } from 'vitest';
  import { useI18n } from 'vue-i18n';
  import { useStudyStore } from '../../stores/studyStore';
  import dayjs from 'dayjs';

  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');

  const studyStore = useStudyStore();

  const scheduler: any = dialogRef.value.data.scheduler;

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
  const repeatEndOptionArray: Ref<MoreTableEditableChoicePropertyValues[]> =
    ref([
      /*{label: 'Never', value: 'never'},*/
      { label: t('scheduler.labels.after'), value: 'after' },
      //{label: 'On Date', value: 'onDate'}
    ]);

  const plannedStartDate: Date = new Date(
    studyStore.study.plannedStart as string
  );
  const setStartDate: Date =
    studyStore.study.plannedStart && plannedStartDate > new Date()
      ? plannedStartDate
      : new Date();

  const start: Ref<Date> = ref(
    scheduler.dtstart ? new Date(scheduler.dtstart) : setStartDate
  );
  const end: Ref<Date> = ref(
    scheduler.dtend ? new Date(scheduler.dtend) : setStartDate
  );

  const allDayChecked: Ref<boolean> = ref(false);
  const repeatChecked: Ref<boolean> = ref(false);

  if (
    scheduler?.dtstart?.substring(11, 19) === '23:00:00' &&
    scheduler?.dtend?.substring(11, 19) === '22:59:59'
  ) {
    allDayChecked.value = true;
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

  function changeDateTime() {
    start.value = new Date(start.value);
    end.value = new Date(end.value);
  }
  function save() {
    const s = start.value;
    const e = end.value;

    s.setMilliseconds(0);
    s.setSeconds(0);
    e.setMilliseconds(0);
    e.setSeconds(0);

    if (allDayChecked.value) {
      if (
        studyStore.study.plannedStart &&
        dayjs(s).format('YYYY-MM-DD') > studyStore.study.plannedStart
      ) {
        s.setHours(0, 0, 0);
      }
      if (
        studyStore.study.plannedEnd &&
        dayjs(e).format('YYYY-MM-DD') < studyStore.study.plannedEnd
      ) {
        e.setHours(23, 59, 59);
      }
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

  onUpdated(() => {
    if (end.value < start.value) {
      end.value = start.value;
      calendarInputErrors.value.end = '';
    }
  });

  function cancel() {
    dialogRef.value.close();
  }

  function repeatCheckedData() {
    if (!repeatChecked.value) {
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
  }

  const calendarInputErrors: Ref<any> = ref({
    start: '',
    end: '',
  });

  function handleCalendarInputUpdate(event: any, date: string) {
    const eventDate: Ref<Date> = ref(
      new Date(
        event.value.substring(3, 5) +
          '/' +
          event.value.substring(0, 2) +
          '/' +
          event.value.substring(6, 10)
      )
    );

    eventDate.value.setHours(
      event.value.substring(11, 13),
      event.value.substring(14, 16),
      0
    );

    if (date === 'start') {
      if (
        eventDate.value < new Date(studyStore.study.plannedStart as string) ||
        eventDate.value > new Date(studyStore.study.plannedEnd as string)
      ) {
        calendarInputErrors.value.start =
          'Please enter a start date-time that lies inside the study range.';
      } else {
        calendarInputErrors.value.start = '';
        start.value = eventDate.value;
      }
      checkEndDateError(end.value, eventDate.value);
    } else if (date === 'end') {
      if (!checkEndDateError(eventDate.value, start.value)) {
        end.value = eventDate.value;
      }
    }

    if (eventDate.value.toString() === 'Invalid Date') {
      if (date === 'start') {
        start.value = new Date();
        calendarInputErrors.value.start =
          'Please enter a valid Date. Date was resetted to today.';
      } else {
        end.value = new Date();
        calendarInputErrors.value.end =
          'Please enter a valid date! Date was resetted to today.';
      }
    }
  }

  function checkEndDateError(endDate: Date, startDate: Date): boolean {
    if (
      endDate < startDate ||
      endDate < new Date(studyStore.study.plannedStart as string) ||
      endDate > new Date(studyStore.study.plannedEnd as string)
    ) {
      calendarInputErrors.value.end =
        'Please enter a end date-time that lies inside the study range and is not in the past.';
      return true;
    } else {
      calendarInputErrors.value.end = '';
      return false;
    }
  }

  function checkStartDateError(startDate: Date): boolean {
    const plannedStartDate = new Date(studyStore.study.plannedStart as string);
    const plannedEndDate = new Date(studyStore.study.plannedEnd as string);

    if (startDate < plannedStartDate || startDate > plannedEndDate) {
      calendarInputErrors.value.start =
        'Please enter a start date-time that lies inside the study range.';
      return true;
    } else {
      calendarInputErrors.value.start = '';
      return false;
    }
  }

  function checkDateRange() {
    checkStartDateError(start.value);
    checkEndDateError(end.value, start.value);
  }

  checkDateRange();
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
          <div class="mb-1">
            <div class="color-primary font-medium">
              {{ $t('scheduler.labels.event.example.titles.singleDay') }}
            </div>
            <div>
              {{ $t('scheduler.labels.event.example.values.singleDay') }}
            </div>
          </div>
          <div class="mb-1">
            <div class="color-primary font-medium">
              {{ $t('scheduler.labels.event.example.titles.series') }}
            </div>
            <div>{{ $t('scheduler.labels.event.example.values.series') }}</div>
          </div>
          <div class="mb-1">
            <div class="color-primary font-medium">
              {{ $t('scheduler.labels.event.example.titles.fullTimespan') }}
            </div>
            <div>
              {{ $t('scheduler.labels.event.example.values.fullTimespan') }}
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-1">{{ $t('global.labels.start') }}</div>
      <Calendar
        v-model="start"
        date-format="dd/mm/yy"
        hour-format="24"
        :show-time="!allDayChecked"
        :placeholder="allDayChecked ? 'dd/mm/yyyy' : 'dd/mm/yyyy hh:mm'"
        :min-date="(new Date(studyStore.study.plannedStart as string) > new Date()) ? new Date(studyStore.study.plannedStart as string) : new Date()"
        :max-date="new Date(studyStore.study.plannedEnd as string)"
        autocomplete="off"
        style="width: 100%"
        class="col-span-5"
        :class="calendarInputErrors.start ? 'input-error' : ''"
        :update:model-value="checkDateRange"
        @date-select="checkDateRange()"
        @blur="handleCalendarInputUpdate($event, 'start')"
      />
      <div
        v-if="calendarInputErrors.start"
        class="error col-span-5 col-start-2"
      >
        {{ calendarInputErrors.start }}
      </div>
      <div class="col-span-1">{{ $t('global.labels.end') }}</div>
      <Calendar
        v-model="end"
        date-format="dd/mm/yy"
        hour-format="24"
        :show-time="!allDayChecked"
        :placeholder="allDayChecked ? 'dd/mm/yyyy' : 'dd/mm/yyyy hh:mm'"
        :min-date="start > new Date() ? start : new Date()"
        :max-date="new Date(studyStore.study.plannedEnd as string)"
        autocomplete="off"
        style="width: 100%"
        class="col-span-5"
        :class="calendarInputErrors.end ? 'input-error' : ''"
        :update:model-value="checkDateRange"
        @date-select="checkDateRange()"
        @blur="handleCalendarInputUpdate($event, 'end')"
      />
      <div v-if="calendarInputErrors.end" class="error col-span-5 col-start-2">
        {{ calendarInputErrors.end }}
      </div>
      <div class="col-span-2 col-start-2">
        {{ $t('scheduler.labels.event.allDay') }}:
        <Checkbox
          v-model="allDayChecked"
          class="ml-2"
          :binary="true"
          @change="changeDateTime()"
        />
      </div>

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
          ></SelectButton>
          <!--<div v-if="intervalError" class="col-span-5 error">{{intervalError}}</div>-->
          <!--<div v-if="repeatFreq" class="col-span-5">
            Every <InputText v-model="repeatInterval" type="text" :placeholder="'2'"/>  <span class="ml-2">{{repeatCountLabel}}</span>
          </div> -->
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
          class="col-span-5 col-start-2 grid grid-cols-4 gap-4"
        >
          <Dropdown
            v-model="repeatEndOption"
            :options="repeatEndOptionArray"
            :option-label="'label'"
            :option-value="'value'"
            class="col-span-1"
            :placeholder="$t('scheduler.placeholder.chooseRepetitionEnd')"
            @change="resetRepeatEndOptions"
          />
          <div v-if="repeatEndOption === 'after'" class="col-span-2">
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

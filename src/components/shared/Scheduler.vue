<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import SelectButton from 'primevue/selectbutton';
  import Checkbox from 'primevue/checkbox';
  import { Frequency, Weekday, Event } from '../../generated-sources/openapi';
  import { MoreTableEditableChoicePropertyValues } from '../../models/MoreTableModel';
  import { dateToDateString } from '../../utils/dateUtils';

  const dialogRef: any = inject('dialogRef');

  const scheduler: any = dialogRef.value.data.scheduler;

  const repeatFreqArray = [
    { label: 'Daily', value: Frequency.Daily, active: true, unit: 'day(s)' },
    { label: 'Weekly', value: Frequency.Weekly, active: true, unit: 'week(s)' },
    //{label: 'Monthly', value: Frequency.Monthly, active: true, unit: 'month(s)'}
  ];
  const repeatWeekdayArray = [
    { label: 'MO', value: Weekday.Mo },
    { label: 'TU', value: Weekday.Tu },
    { label: 'WE', value: Weekday.We },
    { label: 'TH', value: Weekday.Th },
    { label: 'FR', value: Weekday.Fr },
    { label: 'SA', value: Weekday.Sa },
    { label: 'SO', value: Weekday.Su },
  ];
  const repeatYearOptionArray = [
    { label: 'On a specific day', value: 'onSpecific' },
    //{label: 'On specific options', value: 'onOptions'}
  ];
  const repeatBySetPosOptionArray = [
    { label: 'First', value: 1 },
    { label: 'Second', value: 2 },
    { label: 'Third', value: 3 },
    { label: 'Fourth', value: 4 },
    { label: 'Last', value: -1 },
  ];
  const repeatByMonthOptionArray = [
    { label: 'Jan', value: 1 },
    { label: 'Feb', value: 2 },
    { label: 'Mar', value: 3 },
    { label: 'Apr', value: 4 },
    { label: 'Mai', value: 5 },
    { label: 'Jun', value: 6 },
    { label: 'Jul', value: 7 },
    { label: 'Aug', value: 8 },
    { label: 'Sep', value: 9 },
    { label: 'Oct', value: 10 },
    { label: 'Nov', value: 11 },
    { label: 'Dez', value: 12 },
  ];
  const repeatByDayForYearArray = [
    { label: 'Monday', value: [Weekday.Mo] },
    { label: 'Tuesday', value: [Weekday.Tu] },
    { label: 'Wednesday', value: [Weekday.We] },
    { label: 'Thursday', value: [Weekday.Th] },
    { label: 'Friday', value: [Weekday.Fr] },
    { label: 'Saturday', value: [Weekday.Sa] },
    { label: 'Sunday', value: [Weekday.Su] },
    {
      label: 'All days in week',
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
      label: 'All weekdays',
      value: [Weekday.Mo, Weekday.Tu, Weekday.We, Weekday.Th, Weekday.Fr],
    },
    { label: 'All weekend days', value: [Weekday.Sa, Weekday.Su] },
  ];

  const repeatEndOptionArray: Ref<MoreTableEditableChoicePropertyValues[]> =
    ref([
      /*{label: 'Never', value: 'never'},*/
      { label: 'After', value: 'after' },
      //{label: 'On Date', value: 'onDate'}
    ]);

  const start: Ref<Date> = ref(
    scheduler.dtstart ? new Date(scheduler.dtstart) : new Date()
  );
  const end: Ref<Date> = ref(
    scheduler.dtend ? new Date(scheduler.dtend) : new Date()
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
  const repeatCount: Ref<number | undefined> = ref(
    scheduler.rrule && scheduler.rrule.count ? scheduler.rrule.count : undefined
  ); // kein repeatUntil wenn repeatCount // hourly/daily/weekly/monthly/yearly
  const repeatUntil: Ref<Date | undefined> = ref(
    scheduler.rrule && scheduler.rrule.until ? scheduler.rrule.until : undefined
  ); // kein repeatCount wenn repeatUntil //hourly/daily/weekly/monthly/yearly
  const repeatByDay: Ref<Weekday[] | undefined> = ref(
    scheduler.rrule && scheduler.rrule.byday ? scheduler.rrule.byday : undefined
  ); // weekly/monthly/yearly
  const repeatByMonth: Ref<number | undefined> = ref(
    scheduler.rrule && scheduler.rrule.bymonth
      ? scheduler.rrule.bymonth
      : undefined
  ); // monthly/yearly
  const repeatByMonthDay: Ref<number | undefined> = ref(
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
    repeatCount.value = repeatCount.value / repeatByDay.value?.length || 1;
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

  function setRepeatCountLabel(repeatFreq: string) {
    repeatCountLabel.value = repeatFreqArray.find(
      (f: any) => f.value === repeatFreq
    )?.unit;
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

    if (allDayChecked.value) {
      s.setHours(0, 0, 0);
      e.setHours(23, 59, 59);
    }

    if (repeatCount.value && repeatByDay.value?.length) {
      repeatCount.value = repeatCount.value * repeatByDay.value?.length;
    }
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
            ? dateToDateString(repeatUntil.value)
            : undefined,
          count: repeatCount.value,
          interval: repeatInterval.value,
          byday: repeatByDay.value,
          bymonth: repeatByMonth.value,
          bymonthday: repeatByMonthDay.value,
          bysetpos: repeatBySetPos.value,
        };
      }

      dialogRef.value.close(returnEvent);
    } catch (e) {
      console.error('Cannot send schedule event ', e);
    }
  }

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
</script>

<template>
  <div class="scheduler relative">
    <div class="grid grid-cols-6 items-center gap-4">
      <h6 class="col-span-6">First Event</h6>
      <div class="col-span-1">{{ $t('start') }}</div>
      <Calendar
        v-model="start"
        date-format="dd/mm/yy"
        hour-format="24"
        :show-time="!allDayChecked"
        :placeholder="allDayChecked ? 'dd/mm/yyyy' : 'dd/mm/yyyy hh:mm'"
        autocomplete="off"
        style="width: 100%"
        :class="'col-span-5'"
      />
      <div class="col-span-1">{{ $t('end') }}</div>
      <Calendar
        v-model="end"
        date-format="dd/mm/yy"
        hour-format="24"
        :show-time="!allDayChecked"
        :placeholder="allDayChecked ? 'dd/mm/yyyy' : 'dd/mm/yyyy hh:mm'"
        autocomplete="off"
        style="width: 100%"
        :class="'col-span-5'"
      />
      <div class="col-span-2 col-start-2">
        All Day Event:
        <Checkbox
          v-model="allDayChecked"
          class="ml-2"
          :binary="true"
          @change="changeDateTime()"
        />
      </div>
      <div class="col-span-2">
        Repeat:
        <Checkbox
          v-model="repeatChecked"
          class="ml-2"
          :binary="true"
          @change="repeatCheckedData()"
        />
      </div>
      <hr class="col-start-0 col-span-6 mb-4 mt-4" />
      <div v-if="repeatChecked" class="col-span-6 mt-4 grid grid-cols-6 gap-4">
        <!-- Frequency: never to yearly -->
        <div class="col-span-5 col-start-2 grid grid-cols-5 gap-4">
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
          v-if="repeatFreq === Frequency.Weekly"
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
            repeatFreq === Frequency.Yearly || repeatFreq === Frequency.Monthly
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
              :placeholder="'Choose Month'"
            />
            <InputText
              v-model="repeatByMonthDay"
              :placeholder="'Enter Day of Month'"
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
              :placeholder="'Choose General Interval'"
            />
            <Dropdown
              v-model="repeatByDay"
              :options="repeatByDayForYearArray"
              :option-label="'label'"
              :option-value="'value'"
              :placeholder="'Choose Day Interval'"
            />
            <Dropdown
              v-if="repeatFreq === Frequency.Yearly"
              v-model="repeatByMonth"
              :options="repeatByMonthOptionArray"
              :option-label="'label'"
              :option-value="'value'"
              :placeholder="'Choose Month'"
            />
          </div>
        </div>

        <hr
          v-if="repeatFreq === Frequency.Weekly"
          class="col-start-0 col-span-6 mb-4 mt-4"
        />
        <div
          v-if="repeatFreq"
          class="col-start-0 col-span-1 self-center font-medium"
        >
          Repetition ends
        </div>
        <div
          v-if="repeatFreq"
          class="col-span-5 col-start-2 grid grid-cols-3 gap-4"
        >
          <Dropdown
            v-model="repeatEndOption"
            :options="repeatEndOptionArray"
            :option-label="'label'"
            :option-value="'value'"
            class="col-span-2 w-80"
            placeholder="Choose repetition end"
            @change="resetRepeatEndOptions"
          />
          <div v-if="repeatEndOption === 'after'" class="col-span-2">
            <InputText
              v-model="repeatCount"
              type="text"
              :placeholder="'Enter repeat count'"
            />
            <span class="ml-2">{{ repeatCountLabel }}</span>
          </div>
          <div v-else-if="repeatEndOption === 'onDate'" class="col-span-2">
            <Calendar
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
    <div class="pos-bottom grid grid-cols-6">
      <div class="col-start-0 buttons col-span-6 mt-8 justify-end text-right">
        <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
        <Button @click="save()">Save</Button>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
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
</style>

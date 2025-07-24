/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { computed, inject, ref, Ref, watch } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import Checkbox from 'primevue/checkbox';
  import { Event, RecurrenceRule } from '@gs';
  import { useI18n } from 'vue-i18n';
  import { useStudyStore } from '../../stores/studyStore';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import AbsoluteSchedulerRepetition from '../subComponents/AbsoluteSchedulerRepetition.vue';
  import { ScheduleType } from '../../models/Scheduler';
  import { useGlobalStore } from '../../stores/globalStore';

  const dateFormat = useGlobalStore().getDateFormat;
  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');

  const studyStore = useStudyStore();

  const minDate = computed(() => {
    const date = new Date(studyStore.study.plannedStart!);
    date.setHours(0, 0, 0);
    return date;
  });

  const maxDate = computed(() => {
    const date = new Date(studyStore.study.plannedEnd!);
    date.setHours(23, 59, 59);
    return date;
  });

  const scheduler: any = dialogRef.value.data.scheduler;
  const returnSchedule: Ref<Event> = ref({
    type: scheduler.type ?? ScheduleType.Event,
    dtstart: scheduler.dtstart ?? studyStore.study.plannedStart,
    dtend: scheduler.dtend ?? studyStore.study.plannedEnd,
    rrule: scheduler.rrule,
  });

  const calendarStart: Ref<Date> = ref(
    new Date(returnSchedule.value.dtstart as string),
  );
  calendarStart.value.setHours(0, 0, 0);
  const calendarEnd: Ref<Date> = ref(
    new Date(returnSchedule.value.dtend as string),
  );
  calendarEnd.value.setHours(23, 59, 59);
  let calendarEndChangedWithStart: boolean = false;

  watch(calendarStart, (newValue, oldValue) => {
    validateDate('calendarStart', newValue, oldValue);
  });

  watch(calendarEnd, (newValue, oldValue) => {
    if (!calendarEndChangedWithStart) {
      validateDate('calendarEnd', newValue, oldValue);
    }
  });

  const entireDayCheckbox: Ref<boolean> = ref(false);
  if (
    typeof scheduler.dtstart !== 'undefined' &&
    typeof scheduler.dtend !== 'undefined'
  ) {
    if (
      new Date(scheduler.dtstart).getHours() === 0 &&
      new Date(scheduler.dtstart).getMinutes() === 0 &&
      new Date(scheduler.dtstart).getSeconds() === 0 &&
      new Date(scheduler.dtend).getHours() === 23 &&
      new Date(scheduler.dtend).getMinutes() === 59 &&
      new Date(scheduler.dtend).getSeconds() === 59
    ) {
      entireDayCheckbox.value = true;
    }
  }

  const singleDayEventCheckbox: Ref<boolean> = ref(
    calendarStart.value.getDate() === calendarEnd.value.getDate() &&
      calendarStart.value.getMonth() === calendarEnd.value.getMonth() &&
      calendarStart.value.getFullYear() === calendarEnd.value.getFullYear(),
  ); // Individual Observation Checkbox
  const hasRruleValue: Ref<boolean> = ref(!!returnSchedule.value.rrule); // Repeat Event Checkbox

  let rruleErrors: MoreTableChoice[] = [];
  function onChangeSingleDayEventCheckbox(): void {
    if (
      singleDayEventCheckbox.value &&
      calendarStart.value &&
      calendarEnd.value
    ) {
      setTimeout(() => {
        const hours = calendarEnd.value.getHours();
        const minutes = calendarEnd.value.getMinutes();
        const seconds = calendarEnd.value.getSeconds();
        calendarEnd.value.setTime(calendarStart.value.getTime());
        calendarEnd.value.setHours(hours, minutes, seconds);
      }, 60);
    }
    if (!singleDayEventCheckbox.value) {
      rruleErrors = [];
      hasRruleValue.value = false;
    }
  }

  function onChangeEntireDayCheckbox(): void {
    if (entireDayCheckbox.value) {
      calendarStart.value.setHours(0, 0, 0);
      calendarEndChangedWithStart = true;
      setTimeout(() => {
        calendarEnd.value.setHours(23, 59, 59);
      }, 60);
    }
  }

  let errors: MoreTableChoice[] = [];
  let warnings: MoreTableChoice[] = [];

  function getErrorOrWarning(
    type: string,
    label: string,
  ): string | null | undefined {
    switch (type) {
      case 'warning': {
        const item = warnings.find((el) =>
          el.label === label ? el.value : '',
        );
        return item?.value;
      }
      case 'error': {
        const item = errors.find((el) => (el.label === label ? el.value : ''));
        return item?.value;
      }
      default:
        return '';
    }
  }

  function validateDate(
    dateType: string,
    newValue: Date,
    oldValue: Date,
  ): void {
    errors = [];
    warnings = [];

    const updateHours = (targetDate: Ref<Date>, sourceDate: Date): void => {
      targetDate.value.setHours(
        sourceDate.getHours(),
        sourceDate.getMinutes(),
        sourceDate.getSeconds(),
      );
    };

    switch (dateType) {
      case 'calendarStart':
        {
          if (newValue > calendarEnd.value) {
            calendarStart.value = newValue;
            if (oldValue.getDate() !== newValue.getDate()) {
              updateHours(calendarStart, oldValue);
            }
            calendarEndChangedWithStart = true;
            calendarEnd.value = calendarStart.value;
            setTimeout(() => {
              calendarEndChangedWithStart = false;
            }, 60);

            warnings.push({
              label: 'endWasChangedWithStartValue',
              value: t(
                'scheduler.warningsAndErrors.endWasChangedWithStartValue',
              ),
            });
          } else if (oldValue.getDate() !== newValue.getDate()) {
            updateHours(calendarStart, oldValue);
          }
        }
        break;
      case 'calendarEnd': {
        if (oldValue.getDate() !== newValue.getDate()) {
          updateHours(calendarEnd, oldValue);
        }
      }
    }
  }

  function toggleHasRruleValue(rruleCheckbox: boolean): void {
    hasRruleValue.value = rruleCheckbox;
  }

  function onRruleUpdate(schedulerRrule: RecurrenceRule): void {
    if (hasRruleValue.value) {
      returnSchedule.value.rrule = schedulerRrule;
    }
  }

  function onRruleErrorUpdate(updatedRruleErrors: MoreTableChoice[]): void {
    rruleErrors = updatedRruleErrors;
  }

  function save(): void {
    // setCalendarStart and calendarEnd into returnSchedule object
    returnSchedule.value.dtstart = calendarStart.value.toISOString();
    returnSchedule.value.dtend = calendarEnd.value.toISOString();

    // check if repeatedChecked is on -> if not set rrule: undefined, if it is safe rrule with close
    if (!hasRruleValue.value) {
      returnSchedule.value.rrule = undefined;
    }

    if (!errors.length && !rruleErrors.length) {
      try {
        dialogRef.value.close(returnSchedule.value);
      } catch (e) {
        console.error('Cannot send schedule event ', e);
      }
    }
  }

  function cancel(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="scheduler relative">
    <div class="grid grid-cols-6 items-center gap-4">
      <div class="header-info col-span-6 mb-4">
        <h6 class="font-medium">{{ $t('scheduler.labels.event.setDates') }}</h6>
        <div>{{ $t('scheduler.labels.event.setDatesDesc') }}</div>
      </div>

      <div class="col-span-6 mb-4">
        <h5 class="text-color mb-1 font-bold">
          {{ $t('cronSchedule.example.title') }}
        </h5>
        <div class="examples p-2">
          <div class="mb-1.5">
            <div class="color-primary font-medium">
              {{ $t('scheduler.labels.event.example.titles.singleDay') }}
            </div>
            <div>
              <!-- eslint-disable vue/no-v-html -->
              <span
                v-html="
                  $t('scheduler.labels.event.example.values.singleDay', {
                    egDate: $d(new Date('2024-07-27'), 'short'),
                  })
                "
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
                v-html="
                  $t('scheduler.labels.event.example.values.series', {
                    egDate: $d(new Date('2024-07-27'), 'short'),
                  })
                "
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
                  $t('scheduler.labels.event.example.values.fullTimespan', {
                    egStartDate: $d(new Date('2024-07-27'), 'short'),
                    egEndDate: $d(new Date('2024-09-27'), 'short'),
                  })
                "
              />
            </div>
          </div>
        </div>
      </div>

      <hr class="col-span-6" />

      <h6 class="col-span-6 font-medium">
        {{ $t('scheduler.preview.title.individualEvent') }}
      </h6>

      <div class="col-span-1 col-start-1 font-bold">
        {{
          singleDayEventCheckbox
            ? t('scheduler.labels.timeframe')
            : t('global.labels.start')
        }}
      </div>

      <Calendar
        v-model="calendarStart"
        :date-format="dateFormat"
        :placeholder="dateFormat"
        :min-date="minDate"
        :max-date="maxDate"
        :manual-input="false"
        autocomplete="off"
        class="start-date col-span-2 col-start-2 w-full"
      />

      <Calendar
        v-if="!entireDayCheckbox"
        v-model="calendarStart"
        :min-date="minDate"
        :max-date="maxDate"
        :manual-input="false"
        placeholder="hh:mm"
        class="p-calendar-timeonly start-date start-time col-span-1"
        time-only
      />

      <div
        v-if="!singleDayEventCheckbox"
        class="col-span-1 col-start-1 font-bold"
      >
        {{ t('global.labels.end') }}
      </div>

      <Calendar
        v-if="!singleDayEventCheckbox"
        v-model="calendarEnd"
        :min-date="calendarStart"
        :max-date="maxDate"
        :manual-input="false"
        :date-format="dateFormat"
        :placeholder="dateFormat"
        autocomplete="off"
        class="start-date col-span-2 col-start-2 w-full"
        :class="{
          'calendar-warning': getErrorOrWarning(
            'warning',
            'endWasChangedWithStartValue',
          ),
        }"
      />

      <Calendar
        v-if="!entireDayCheckbox"
        v-model="calendarEnd"
        :manual-input="false"
        :min-date="minDate"
        :max-date="maxDate"
        placeholder="hh:mm"
        class="p-calendar-timeonly start-date start-time col-span-1"
        :class="{
          'calendar-warning': getErrorOrWarning(
            'warning',
            'endWasChangedWithStartValue',
          ),
        }"
        time-only
      />
      <div
        v-if="getErrorOrWarning('warning', 'endWasChangedWithStartValue')"
        class="warning col-span-6 col-start-2"
      >
        {{ getErrorOrWarning('warning', 'endWasChangedWithStartValue') }}
      </div>

      <div class="col-span-7 col-start-2 grid grid-cols-2">
        <div class="flex flex-row items-center justify-start">
          {{ $t('scheduler.labels.event.oneDayObservation') }}:
          <Checkbox
            v-model="singleDayEventCheckbox"
            class="ml-2"
            :binary="true"
            @change="onChangeSingleDayEventCheckbox()"
          />
        </div>
        <div class="flex flex-row items-center justify-start">
          <span>{{ $t('scheduler.labels.event.allDay') }}</span>
          <Checkbox
            v-model="entireDayCheckbox"
            class="ml-2"
            :binary="true"
            @change="onChangeEntireDayCheckbox()"
          />
        </div>
      </div>

      <!-- import repeat -->
      <AbsoluteSchedulerRepetition
        v-if="singleDayEventCheckbox"
        :rrule-checked="hasRruleValue"
        :scheduler-rrule="returnSchedule.rrule"
        class="col-span-8"
        @on-rrule-checkbox-change="toggleHasRruleValue($event)"
        @on-rrule-change="onRruleUpdate($event)"
        @on-rrule-error="onRruleErrorUpdate($event)"
      />
    </div>

    <div class="h-24"></div>
    <div class="absolute bottom-5 right-5 grid w-full grid-cols-6">
      <div
        class="col-start-0 col-span-6 mt-8 flex flex-row items-center justify-end text-right"
      >
        <Button
          class="btn-gray !mr-3"
          :label="$t('global.labels.cancel')"
          @click="cancel()"
        />
        <Button :label="$t('global.labels.save')" @click="save()" />
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

  .examples {
    border: 1px solid var(--surface-50);
    border-radius: 6px;
    background-color: var(--surface-50);
  }

  :deep(.calendar-warning) {
    border: var(--border-weight) var(--border-style) var(--yellow-600);
  }
</style>

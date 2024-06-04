/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref, Ref, watch } from 'vue';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import Checkbox from 'primevue/checkbox';
  import { Event, RecurrenceRule } from '../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import { useStudyStore } from '../../stores/studyStore';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import AbsoluteSchedulerRepetition from '../subComponents/AbsoluteSchedulerRepetition.vue';

  const { t } = useI18n();
  const dialogRef: any = inject('dialogRef');

  const studyStore = useStudyStore();

  const scheduler: any = dialogRef.value.data.scheduler;
  const returnSchedule: Ref<Event> = ref({
    type: scheduler.type ? scheduler.type : 'Event',
    dtstart: scheduler.dtstart
      ? scheduler.dtstart
      : studyStore.study.plannedStart,
    dtend: scheduler.dtend ? scheduler.dtend : studyStore.study.plannedEnd,
    rrule: scheduler.rrule,
  });

  const calendarStart: Ref<Date> = ref(
    new Date(returnSchedule.value.dtstart as string),
  );
  const calendarEnd: Ref<Date> = ref(
    new Date(returnSchedule.value.dtend as string),
  );
  const calendarEndChangedWithStart: Ref<boolean> = ref(false);

  watch(calendarStart, async (newValue, oldValue) => {
    validateDate('calendarStart', newValue, oldValue);
  });

  watch(calendarEnd, async (newValue, oldValue) => {
    if (!calendarEndChangedWithStart.value) {
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
  const hasRruleValue: Ref<boolean> = ref(
    !returnSchedule.value.rrule ? false : true,
  ); // Repeat Event Checkbox

  function onChangeSingleDayEventCheckbox() {
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
      rruleErrors.value = [];
      hasRruleValue.value = false;
    }
  }

  function onChangeEntireDayCheckbox() {
    if (entireDayCheckbox.value) {
      calendarStart.value.setHours(0, 0, 0);
      calendarEndChangedWithStart.value = true;
      setTimeout(() => {
        calendarEnd.value.setHours(23, 59, 59);
      }, 60);
    }
  }

  const errors: Ref<Array<MoreTableChoice>> = ref([]);
  const warnings: Ref<Array<MoreTableChoice>> = ref([]);
  function getErrorOrWarning(
    type: string,
    label: string,
  ): string | null | undefined {
    switch (type) {
      case 'warning': {
        const item = warnings.value.find((el) =>
          el.label === label ? el.value : '',
        );
        return item?.value;
      }
      case 'error': {
        const item = errors.value.find((el) =>
          el.label === label ? el.value : '',
        );
        return item?.value;
      }
      default:
        return '';
    }
  }

  function validateDate(dateType: string, newValue: Date, oldValue: Date) {
    errors.value = [];
    warnings.value = [];
    switch (dateType) {
      case 'calendarStart':
        {
          if (newValue > calendarEnd.value) {
            calendarStart.value = newValue;
            if (oldValue.getDate() !== newValue.getDate()) {
              calendarStart.value.setHours(
                oldValue.getHours(),
                oldValue.getMinutes(),
                oldValue.getSeconds(),
              );
            }
            calendarEndChangedWithStart.value = true;
            calendarEnd.value = calendarStart.value;
            setTimeout(() => {
              calendarEndChangedWithStart.value = false;
            }, 60);

            warnings.value.push({
              label: 'endWasChangedWithStartValue',
              value: t(
                'scheduler.warningsAndErrors.endWasChangedWithStartValue',
              ),
            });
          } else {
            if (oldValue.getDate() !== newValue.getDate()) {
              calendarStart.value.setHours(
                oldValue.getHours(),
                oldValue.getMinutes(),
                oldValue.getSeconds(),
              );
            }
          }
        }
        break;
      case 'calendarEnd': {
        if (oldValue.getDate() !== newValue.getDate()) {
          calendarEnd.value.setHours(
            oldValue.getHours(),
            oldValue.getMinutes(),
            oldValue.getSeconds(),
          );
        }
      }
    }
  }

  function toggleHasRruleValue(rruleCheckbox: boolean) {
    hasRruleValue.value = rruleCheckbox;
  }

  function onRruleUpdate(schedulerRrule: RecurrenceRule) {
    if (hasRruleValue.value) {
      returnSchedule.value.rrule = schedulerRrule;
    }
  }

  const rruleErrors: Ref<MoreTableChoice[]> = ref([]);
  function onRruleErrorUpdate(updatedRruleErrors: MoreTableChoice[]) {
    rruleErrors.value = updatedRruleErrors;
  }

  function save() {
    // setCalendarStart and calendarEnd into returnSchedule object
    returnSchedule.value.dtstart = calendarStart.value.toISOString();
    returnSchedule.value.dtend = calendarEnd.value.toISOString();

    // check if repeateChecked is on -> if not set rrule: undefined, if it is save rrule with close
    if (!hasRruleValue.value) {
      returnSchedule.value.rrule = undefined;
    }

    if (!errors.value.length && !rruleErrors.value.length) {
      try {
        dialogRef.value.close(returnSchedule.value);
      } catch (e) {
        console.error('Cannot send schedule event ', e);
      }
    }
  }

  function cancel() {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="scheduler relative">
    <div class="grid grid-cols-6 items-center gap-4">
      <div class="header-info col-span-6 mb-4">
        <h6>{{ $t('scheduler.labels.event.setDates') }}</h6>
        <div>{{ $t('scheduler.labels.event.setDatesDesc') }}</div>
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

      <hr class="col-span-6" />

      <h6 class="col-span-6">
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
        date-format="dd/mm/yy"
        :placeholder="'dd/mm/yyyy'"
        :min-date="new Date(studyStore.study.plannedStart as string)"
        :max-date="new Date(studyStore.study.plannedEnd as string)"
        :manual-input="false"
        autocomplete="off"
        class="start-date col-span-2 col-start-2 w-full"
      />

      <Calendar
        v-if="!entireDayCheckbox"
        v-model="calendarStart"
        :min-date="new Date(studyStore.study.plannedStart as string)"
        :max-date="new Date(studyStore.study.plannedEnd as string)"
        :manual-input="false"
        :placeholder="'hh:mm'"
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
        :max-date="new Date(studyStore.study.plannedEnd as string)"
        :manual-input="false"
        date-format="dd/mm/yy"
        :placeholder="'dd/mm/yyyy'"
        autocomplete="off"
        class="start-date col-span-2 col-start-2 w-full"
        :class="
          getErrorOrWarning('warning', 'endWasChangedWithStartValue')
            ? 'calendar-warning'
            : ''
        "
      />

      <Calendar
        v-if="!entireDayCheckbox"
        v-model="calendarEnd"
        :manual-input="false"
        :min-date="new Date(studyStore.study.plannedStart as string)"
        :max-date="new Date(studyStore.study.plannedEnd as string)"
        :placeholder="'hh:mm'"
        class="p-calendar-timeonly start-date start-time col-span-1"
        :class="
          getErrorOrWarning('warning', 'endWasChangedWithStartValue')
            ? 'calendar-warning'
            : ''
        "
        time-only
      />
      <div
        v-if="getErrorOrWarning('warning', 'endWasChangedWithStartValue')"
        class="warning col-span-6 col-start-2"
      >
        {{ getErrorOrWarning('warning', 'endWasChangedWithStartValue') }}
      </div>

      <div class="checkboxen col-span-7 col-start-2 grid grid-cols-2">
        <div class="col-start-1">
          {{ $t('scheduler.labels.event.oneDayObservation') }}:
          <Checkbox
            v-model="singleDayEventCheckbox"
            class="ml-2"
            :binary="true"
            @change="onChangeSingleDayEventCheckbox()"
          />
        </div>
        <div>
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

  :deep(.calendar-warning) {
    border: var(--border-weight) var(--border-style) var(--yellow-600);
  }
</style>

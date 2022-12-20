<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import {
    Observation,
    Event,
    Frequency,
    ValidationReport,
  } from '../../generated-sources/openapi';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import Scheduler from '../shared/Scheduler.vue';
  import { useDialog } from 'primevue/usedialog';
  import dayjs from 'dayjs';
  import { useComponentsApi } from '../../composable/useApi';

  const dialog = useDialog();
  const { componentsApi } = useComponentsApi();

  const dialogRef: any = inject('dialogRef');
  const observation = dialogRef.value.data.observation as Observation;
  const groupStates = dialogRef.value.data.groupStates || [];
  const factory = dialogRef.value.data.factory;

  const title = ref(observation.title);
  const purpose = ref(observation.purpose);
  const participantInfo = ref(observation.participantInfo);
  // properties = configuration
  const properties = ref(
    JSON.stringify(
      observation.properties
        ? observation.properties
        : factory.defaultProperties
    )
  );
  const scheduler: Ref<Event> = ref(
    observation.schedule ? observation.schedule : {}
  );
  const studyGroupId = ref(observation.studyGroupId);

  const jsonError = ref();

  function getLabelForChoiceValue(value: any, values: MoreTableChoice[]) {
    if (value) {
      const v = value.toString();
      return values.find((s: any) => s.value === v)?.label;
    }
    return undefined;
  }

  function openScheduler() {
    dialog.open(Scheduler, {
      data: {
        scheduler: scheduler.value,
      },
      props: {
        header: 'Manage Schedule',
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
      },
      onClose: (options) => {
        if (options?.data) {
          scheduler.value = options.data;
        }
      },
    });
  }

  function validate() {
    let parsedProps: any;
    try {
      parsedProps = JSON.parse(properties.value.toString());
      componentsApi
        .validateProperties(
          'observation',
          observation.type as string,
          parsedProps
        )
        .then((response: any) => response.data)
        .then((report: ValidationReport) => {
          if (report.valid) {
            save(parsedProps);
          } else {
            jsonError.value = (report.errors || [])
              .concat(report.warnings || [])
              .map((e) => e.message)
              .join(', ');
          }
        });
    } catch (e) {
      jsonError.value = 'Cannot parse properties, no valid json';
    }
  }

  function save(props: any) {
    const returnObservation = {
      observationId: observation.observationId,
      title: title.value,
      purpose: purpose.value,
      participantInfo: participantInfo.value,
      type: observation.type,
      properties: props,
      schedule: scheduler.value,
      studyGroupId: studyGroupId.value,
    } as Observation;

    if(JSON.stringify(scheduler.value) !== '{}') {
      dialogRef.value.close(returnObservation);
    }
  }

  const errors: Ref<Array<any>> = ref([]);
  const schedulerError: Ref<Boolean> = ref(false);

  function checkRequiredFields() {
    errors.value = [];
    schedulerError.value = false;
    if(!title.value) {
      errors.value.push('Observation Title')
    }
    if(JSON.stringify(scheduler.value) === '{}') {
      errors.value.push('Scheduler')
      schedulerError.value = true;
    }
    if(!participantInfo.value) {
      errors.value.push('Participants Information')
    }
    if(properties.value === '{}') {
      errors.value.push('Configuration')
    }
  }

  function cancel() {
    dialogRef.value.close();
  }

  function getFrequencyLabel(frequency: Frequency) {
    switch (frequency) {
      case Frequency.Hourly:
        return 'hour(s)';
      case Frequency.Daily:
        return 'day(s)';
      case Frequency.Weekly:
        return 'week(s)';
      case Frequency.Monthly:
        return 'month(s)';
      case Frequency.Yearly:
        return 'year(s)';
    }
  }

  function getByMonthDayLabel(monthDay: number) {
    if (monthDay > 3 && monthDay < 21) return 'th';
    switch (monthDay % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  function getMonthLabel(month: number) {
    switch (month) {
      case 1:
        return 'January';
      case 2:
        return 'February';
      case 3:
        return 'March';
      case 4:
        return 'April';
      case 5:
        return 'Mai';
      case 6:
        return 'June';
      case 7:
        return 'July';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'October';
      case 11:
        return 'November';
      case 12:
        return 'Dezember';
    }
  }

  function getByStepPosLabel(setPos: number) {
    switch (setPos) {
      case 1:
        return 'first';
      case 2:
        return 'second';
      case 3:
        return 'third';
      case 4:
        return 'fourth';
      case -1:
        return 'last';
    }
  }

  function removeScheduler() {
    if (scheduler.value) {
      scheduler.value = {};
    }
  }
</script>

<template>
  <div class="observation-dialog">
    <div class="mb-4">
      <h5>{{ factory.title }}</h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6 v-html="factory.description"></h6>
    </div>

    <form
      id="observationDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      @submit.prevent="validate()"
    >

      <div v-if="errors.length" class="error col-span-8">
        <span class="font-medium">
          Please fill out following information fields:
        </span>
        <div>
          <span v-for="(error, index) in errors" :key="index">
            {{error}}<span v-if="index < errors.length -1" class="mr-0.5 inline">,</span>
          </span>
        </div>
      </div>
      <div class="col-start-0 col-span-2">
        <h5>{{ $t('observation') }} {{ $t('title') }}</h5>
      </div>
      <div class="col-span-6 col-start-3">
        <InputText
          v-model="title"
          type="text"
          required
          :placeholder="$t('placeholder.title')"
          style="width: 100%"
        ></InputText>
      </div>
      <div class="col-start-0 col-span-8 grid grid-cols-8">
        <h5 class="col-start-0 col-span-8">Scheduler</h5>
        <div
          class="col-start-0 col-span-8 grid grid-cols-7 items-start justify-start gap-4"
        >
          <div class="col-span-5">
            <div
              v-if="scheduler.dtstart"
              class="grid grid-cols-2 gap-x-4 gap-y-1"
            >
              <div>
                <span class="font-medium">{{ $t('start') }}: </span>
                <span>
                  {{
                    dayjs(scheduler.dtstart).format('DD/MM/YYYY, HH:mm')
                  }}</span
                >
              </div>
              <div>
                <span class="font-medium">{{ $t('end') }}: </span
                >{{ dayjs(scheduler.dtend).format('DD/MM/YYYY, HH:mm') }}
              </div>

              <div
                v-if="scheduler.rrule && scheduler.rrule.freq"
                class="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1"
              >
                <div>
                  <span class="font-medium">Frequency: </span
                  >{{ scheduler.rrule.freq }}
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
                  Every
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
                  {{ getMonthLabel(scheduler.rrule.bymonth) }}
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
                <span class="font-medium">Days selected: </span>
                <span
                  v-for="(day, index) in scheduler.rrule.byday"
                  :key="index"
                  class="day"
                >
                  {{ day }}
                </span>
              </div>

              <div
                v-if="scheduler.rrule && scheduler.rrule.count"
                class="col-span-2"
              >
                <span class="font-medium">Repetition end:</span> after
                <span v-if="scheduler.rrule?.byday?.length">{{
                  scheduler.rrule.count / scheduler.rrule.byday.length
                }}</span>
                <span v-else>{{ scheduler.rrule.count }}</span>
                {{ getFrequencyLabel(scheduler.rrule.freq) }}
              </div>
              <div
                v-if="scheduler.rrule && scheduler.rrule.until"
                class="col-span-2"
              >
                <span class="font-medium">Repetition end: </span> on
                {{ scheduler.rrule.until }}
              </div>
            </div>
            <div v-else class="text-gray-400">
              <span v-if="schedulerError" class="error">Please set schedule for your observation.</span>
              <span v-else>Schedule is not set yet.</span>
            </div>
          </div>
          <div class="col-span-2 grid grid-cols-1 gap-1">
            <Button class="justify-center" type="button" @click="openScheduler"
              >Open Scheduler</Button
            >
            <Button
              v-if="scheduler.dtstart"
              class="justify-center"
              type="button"
              @click="removeScheduler"
              >Remove Schedule</Button
            >
          </div>
        </div>
      </div>
      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('purpose') }}</h5>
        <Textarea
          v-model="purpose"
          :placeholder="$t('placeholder.purpose')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('participantInfo') }}</h5>
        <Textarea
          v-model="participantInfo"
          required
          :placeholder="$t('placeholder.participantInfo')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">Configuration</h5>
        <div v-if="jsonError" class="error mb-3">{{ jsonError }}</div>
        <div class="col-start-0 col-span-8">
          <Textarea
            v-model="properties"
            required
            placeholder="Enter the main purpose and intention of the study."
            :auto-resize="true"
            style="width: 100%"
          ></Textarea>
        </div>
      </div>

      <div
        class="col-start-0 col-span-8"
        :class="[studyGroupId ? 'groupIdValue' : '']"
      >
        <Dropdown
          v-model="studyGroupId"
          :options="groupStates"
          option-label="label"
          option-value="value"
          :placeholder="
            getLabelForChoiceValue(studyGroupId, groupStates) ||
            $t('entireStudy')
          "
        >
        </Dropdown>
      </div>

      <div class="col-start-0 buttons col-span-8 mt-8 justify-end text-right">
        <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
        <Button type="submit" @click="checkRequiredFields()">Save</Button>
      </div>
    </form>
  </div>
</template>

<style lang="postcss">
  .observation-dialog {
    .buttons {
      button {
        margin-left: 10px;
      }
    }
    .error {
      color: #d57575;
    }
    .day {
      &:after {
        content: ', ';
      }
      &:last-of-type:after {
        content: '';
      }
    }
    .groupIdValue {
      color: var(--text-color);
    }
  }
</style>

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
    StudyStatus,
  } from '../../generated-sources/openapi';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import Scheduler from '../shared/Scheduler.vue';
  import { useDialog } from 'primevue/usedialog';
  import dayjs from 'dayjs';
  import { useComponentsApi } from '../../composable/useApi';
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import {IntegerProperty, Property, StringProperty} from '../../models/InputModels';
  import StringPropertyInput from './shared/StringPropertyInput.vue';
  import IntegerPropertyInput from './shared/IntegerPropertyInput.vue';

  const dialog = useDialog();
  const { componentsApi } = useComponentsApi();
  const studyStore = useStudyStore();
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const observation = dialogRef.value.data.observation as Observation;
  const groupStates = dialogRef.value.data.groupStates || [];
  const factory = dialogRef.value.data.factory;
  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused;

  const title = ref(observation.title);
  const purpose = ref(observation.purpose);
  const participantInfo = ref(observation.participantInfo);
  // properties = configuration
  const properties: Property<any>[] = factory.properties
    .map((json: any) => Property.fromJson(json))
    .map((p: Property<any>) => p.setValue(observation.properties?.[p.id]))
    //.map((p: Property<any>) => ref(p));

  console.log(properties);

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
        header: t('scheduler.dialogTitle'),
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
      parsedProps = Property.toJson(properties);
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
      console.log(e)
      jsonError.value = t('observation.error.noValidJson') + ": " + e;
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

    if (JSON.stringify(scheduler.value) !== '{}') {
      dialogRef.value.close(returnObservation);
    }
  }

  const errors: Ref<Array<MoreTableChoice>> = ref([]);
  const schedulerError: Ref<boolean> = ref(false);

  function checkRequiredFields() {
    errors.value = [];
    schedulerError.value = false;
    if (!title.value) {
      errors.value.push({
        label: 'title',
        value: t('observation.error.addTitle'),
      });
    }
    if (JSON.stringify(scheduler.value) === '{}') {
      errors.value.push({
        label: 'scheduler',
        value: t('observation.error.addSchedulerMsg'),
      });
      schedulerError.value = true;
    }
    if (!participantInfo.value) {
      errors.value.push({
        label: 'participantInfo',
        value: t('observation.error.addParticipantInfo'),
      });
    }
  }

  function getError(label: string): string | null | undefined {
    const item = errors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
  }

  function cancel() {
    dialogRef.value.close();
  }

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

  function removeScheduler() {
    if (scheduler.value) {
      scheduler.value = {};
    }
  }
</script>

<template>
  <div class="dialog" :class="editable ? '' : 'dialog-disabled'">
    <div class="mb-4" :class="editable ? '' : 'pb-4'">
      <h5 class="mb-1">{{ factory.title }}</h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6 v-html="factory.description"></h6>
    </div>

    <form
      id="observationDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      @submit.prevent="validate()"
    >
      <div class="col-start-0 col-span-6" :class="editable ? '' : 'pb-4'">
        <h5 class="mb-1">
          {{ $t('observation.singular') }} {{ $t('study.props.title') }}*
        </h5>
        <div v-if="getError('title')" class="error mb-4">
          {{ getError('title') }}
        </div>
        <div class="col-start-0 col-span-6" :class="editable ? '' : 'pb-4'">
          <InputText
            v-model="title"
            type="text"
            required
            :placeholder="$t('study.placeholder.titleInput')"
            style="width: 100%"
            :disabled="!editable"
          ></InputText>
        </div>
      </div>

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
            <div
              v-if="scheduler.dtstart"
              class="grid grid-cols-2 gap-x-4 gap-y-1"
            >
              <div>
                <span class="font-medium"
                  >{{ $t('global.labels.start') }}:
                </span>
                <span>
                  {{
                    dayjs(scheduler.dtstart).format('DD/MM/YYYY, HH:mm')
                  }}</span
                >
              </div>
              <div>
                <span class="font-medium">{{ $t('global.labels.end') }}: </span
                >{{ dayjs(scheduler.dtend).format('DD/MM/YYYY, HH:mm') }}
              </div>

              <div
                v-if="scheduler.rrule && scheduler.rrule.freq"
                class="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1"
              >
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
                  class="day"
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
                {{ $t('scheduler.labels.after') }}
                <span v-if="scheduler.rrule?.byday?.length">{{
                  scheduler.rrule.count / scheduler.rrule.byday.length
                }}</span>
                <span v-else>{{ scheduler.rrule.count }}</span>
                <span v-if="scheduler.rrule.freq">
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
              <div v-if="getError('scheduler')" class="error mb-4">
                {{ getError('scheduler') }}
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
              @click="openScheduler"
              >{{ $t('scheduler.labels.openScheduler') }}</Button
            >
            <Button
              v-if="scheduler.dtstart"
              class="justify-center"
              type="button"
              :disabled="!editable"
              @click="removeScheduler"
              >{{ $t('scheduler.labels.removeScheduler') }}</Button
            >
          </div>
        </div>
      </div>
      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('study.props.purpose') }}</h5>
        <Textarea
          v-model="purpose"
          :placeholder="$t('study.placeholder.purposeInput')"
          :auto-resize="true"
          style="width: 100%"
          :disabled="!editable"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-8">
        <h5 :class="getError('participantInfo') ? 'mb-1' : 'mb-2'">
          {{ $t('study.props.participantInfo') }}*
        </h5>
        <div v-if="getError('participantInfo')" class="error mb-4">
          {{ getError('participantInfo') }}
        </div>
        <Textarea
          v-model="participantInfo"
          required
          :placeholder="$t('study.placeholder.participantInfoInput')"
          :auto-resize="true"
          style="width: 100%"
          :disabled="!editable"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('global.labels.config') }}</h5>
        <div v-if="jsonError" class="error mb-3">{{ jsonError }}</div>
        <div class="col-start-0 col-span-8">
          <div v-for="(property, index) in properties" :key="index">
            <StringPropertyInput v-if="property instanceof StringProperty" :property="property"></StringPropertyInput>
            <IntegerPropertyInput v-if="property instanceof IntegerProperty" :property="property"></IntegerPropertyInput>
          </div>
        </div>
      </div>

      <div
        class="col-start-0 col-span-8"
        :class="[studyGroupId ? 'groupIdValue' : '']"
      >
        <h5 v-if="!editable" class="pb-2 font-bold">
          {{ $t('study.props.studyGroup') }}
        </h5>
        <Dropdown
          v-model="studyGroupId"
          :options="groupStates"
          option-label="label"
          option-value="value"
          :disabled="!editable"
          :placeholder="
            getLabelForChoiceValue(studyGroupId, groupStates) ||
            $t('global.placeholder.entireStudy')
          "
        >
        </Dropdown>
      </div>

      <div class="col-start-0 buttons col-span-8 mt-8 justify-end text-right">
        <Button class="btn-gray" @click="cancel()">
          <span v-if="editable">{{ $t('global.labels.cancel') }}</span>
          <span v-else>{{ $t('global.labels.close') }}</span>
        </Button>
        <Button
          v-if="editable"
          :type="editable ? 'submit' : undefined"
          :disabled="!editable"
          @click="checkRequiredFields()"
          >{{ $t('global.labels.save') }}</Button
        >
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
  @import '../../styles/components/moreTable-dialogs.pcss';
  .dialog {
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

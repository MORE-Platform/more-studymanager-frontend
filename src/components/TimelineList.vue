/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import VueCal, { Event } from 'vue-cal';
  import 'vue-cal/dist/vuecal.css';
  import { useI18n } from 'vue-i18n';
  import { computed, PropType, ref, Ref } from 'vue';
  import Calendar from 'primevue/calendar';
  import DynamicDialog from 'primevue/dynamicdialog';
  import { useDialog } from 'primevue/usedialog';
  import Dropdown, { DropdownChangeEvent } from 'primevue/dropdown';
  import MultiSelect from 'primevue/multiselect';
  import Button from 'primevue/button';
  import {
    ComponentFactory,
    InterventionTimelineEvent,
    ListComponentsComponentTypeEnum,
    ObservationTimelineEvent,
    Participant,
    StudyGroup,
    StudyTimeline,
  } from '../generated-sources/openapi';
  import { useStudyStore } from '../stores/studyStore';
  import {
    useCalendarApi,
    useComponentsApi,
    useParticipantsApi,
  } from '../composable/useApi';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { dateToDateString } from '../utils/dateUtils';
  import TimelineDialog from './dialog/TimelineDialog.vue';
  const dialog = useDialog();
  const { t, locale } = useI18n();
  const studyStore = useStudyStore();
  const { calendarApi } = useCalendarApi();
  const { participantsApi } = useParticipantsApi();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();

  interface groupOption {
    label: string;
    items: Array<dropdownOption>;
  }

  interface dropdownOption {
    label: string;
    value: string | undefined;
  }

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
  });

  const filterRelativeStartDate = ref();
  const filterStudyGroup = ref();
  const filterParticipant = ref();
  const filterObservationAndIntervention = ref();
  const timelineEventsList: Ref<Event[]> = ref([]);
  const factories: ComponentFactory[] = await getFactories();

  const studyStartDate =
    studyStore.study.start ?? studyStore.study.plannedStart;
  const studyEndDate = studyStore.study.end ?? studyStore.study.plannedEnd;

  let selectedDate = dateToDateString(new Date());
  if (selectedDate && studyEndDate && selectedDate > studyEndDate) {
    selectedDate = studyEndDate;
  } else if (selectedDate && studyStartDate && selectedDate < studyStartDate) {
    selectedDate = studyStartDate;
  }

  let participantsList: Participant[] = [];
  const observationAndInterventionOptions: Ref<groupOption[]> = ref([]);
  const participantOptions: Ref<dropdownOption[]> = ref([
    {
      label: t('participants.placeholder.allParticipants'),
      value: undefined,
    } as dropdownOption,
  ]);

  const studyGroupOptions: Ref<dropdownOption[]> = ref([
    {
      label: t('global.placeholder.entireStudy'),
      value: undefined,
    } as dropdownOption,
  ]);

  studyGroupOptions.value.push(
    ...props.studyGroups.map(
      (studyGroup) =>
        ({
          label: studyGroup.title,
          value: studyGroup.studyGroupId?.toString(),
        }) as dropdownOption,
    ),
  );

  const events = computed(() => {
    return timelineEventsList.value.filter((event: Event) => {
      return (
        filterObservationAndIntervention.value.includes(event.cType) ||
        event.allDay ||
        event.class === 'participant-joined'
      );
    });
  });

  function setupEventsList(rsData: StudyTimeline) {
    timelineEventsList.value = [];

    timelineEventsList.value.push({
      start: dateToDateString(new Date(studyStartDate as string)),
      end: dateToDateString(new Date(studyStartDate as string)),
      title: studyStore.study.start
        ? t('timeline.labels.studyStart')
        : t('timeline.labels.plannedStart'),
      class: 'study-date',
      allDay: true,
    } as Event);

    if (rsData.studyDuration) {
      timelineEventsList.value.push({
        start: new Date(rsData.studyDuration.from as string),
        end: new Date(rsData.studyDuration.to as string),
        title: t('timeline.labels.study'),
        class: 'study-range',
        allDay: true,
      } as Event);
    }

    if (rsData.participantSignup) {
      timelineEventsList.value.push({
        start: new Date(rsData.participantSignup as string),
        end: new Date(
          new Date(rsData.participantSignup).getTime() + 30 * 60000,
        ),
        title: t('timeline.labels.participantJoined'),
        class: 'participant-joined',
      } as Event);
    }

    rsData.observations?.forEach((observation: ObservationTimelineEvent) => {
      const event: Event = {
        start: new Date(observation.start ?? ''),
        end: new Date(observation.end ?? ''),
        title: observation.title,
        class: 'observation',
        cHidden: observation.hidden,
        cScheduleType: t(`scheduler.type.${observation.scheduleType}`),
        cTypeTranslation: t(
          getTranslationKeyByObservationOrInterventionType(observation.type),
        ),
        cType: observation.type,
        cPurpose: observation.purpose,
      };
      timelineEventsList.value.push(event);
    });
    rsData.interventions?.forEach((intervention: InterventionTimelineEvent) => {
      const event: Event = {
        start: new Date(intervention.start ?? ''),
        end: new Date(
          new Date(intervention.start ?? '').getTime() + 30 * 60000,
        ),
        title: intervention.title,
        class: 'intervention',
        cTypeTranslation: t(
          getTranslationKeyByObservationOrInterventionType(
            intervention.scheduleType,
          ),
        ),
        cType: intervention.scheduleType,
        cPurpose: intervention.purpose,
      };

      timelineEventsList.value.push(event);
    });

    timelineEventsList.value.push({
      start: dateToDateString(new Date(studyEndDate as string)),
      end: dateToDateString(new Date(studyEndDate as string)),
      title: studyStore.study.end
        ? t('timeline.labels.studyEnd')
        : t('timeline.labels.plannedEnd'),
      class: 'study-date',
      allDay: true,
    } as Event);
  }

  function getTranslationKeyByObservationOrInterventionType(
    type: string | undefined,
  ): string {
    for (let i = 0, len = factories.length; i < len; i++) {
      if (factories[i].componentId === type) {
        return factories[i].title ?? '';
      }
    }

    return '';
  }

  function onStudyGroupFilterChange(e: DropdownChangeEvent) {
    const filteredOptions: dropdownOption[] = [];
    const filteredParticipants: Participant[] = [];

    filteredOptions.push({
      label: t('global.placeholder.entireStudy'),
      value: undefined,
    } as dropdownOption);

    if (e.value) {
      filteredParticipants.push(
        ...participantsList.filter(
          (participant) => participant.studyGroupId === parseInt(e.value),
        ),
      );
    } else {
      filteredParticipants.push(...participantsList);
    }

    filteredOptions.push(
      ...filteredParticipants.map(
        (fp) =>
          ({
            label: fp.alias,
            value: fp.participantId?.toString(),
          }) as dropdownOption,
      ),
    );

    participantOptions.value = filteredOptions;
    listTimeline();
  }

  function onParticipantFilterChange(e: DropdownChangeEvent) {
    filterStudyGroup.value = getStudyGroupIdByParticipantId(parseInt(e.value));
    listTimeline();
  }

  function onEventClick(event: Event, e: MouseEvent) {
    if (event.allDay) {
      return;
    }
    dialog.open(TimelineDialog, {
      data: {
        event: event,
      },
      props: {
        header: event.title,
        style: {
          width: '30vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
      },
    });

    e.stopPropagation();
  }

  function getStudyGroupIdByParticipantId(id: number): string | undefined {
    const foundParticipant = participantsList.find(
      (p) => p.participantId === id,
    );

    return foundParticipant?.studyGroupId?.toString();
  }

  function clearAllFilters() {
    filterRelativeStartDate.value = undefined;
    filterStudyGroup.value = undefined;
    filterParticipant.value = undefined;
    filterObservationAndIntervention.value = [];
    listTimeline();
  }

  function setupObservationAndInterventionFilterOptions(rsData: StudyTimeline) {
    observationAndInterventionOptions.value = [];
    const observationOptions: dropdownOption[] = [];
    const interventionOptions: dropdownOption[] = [];

    rsData.observations?.forEach((observation: ObservationTimelineEvent) => {
      const existingOption = observationOptions.some(
        (option: dropdownOption) => option.value === observation.type,
      );

      if (!existingOption) {
        observationOptions.push({
          label: t(
            getTranslationKeyByObservationOrInterventionType(observation.type),
          ),
          value: observation.type,
        } as dropdownOption);
      }
    });
    rsData.interventions?.forEach((intervention: InterventionTimelineEvent) => {
      const existingOption = interventionOptions.some(
        (option: dropdownOption) => option.value === intervention.scheduleType,
      );

      if (!existingOption) {
        interventionOptions.push({
          label: t(
            getTranslationKeyByObservationOrInterventionType(
              intervention.scheduleType,
            ),
          ),
          value: intervention.scheduleType,
        } as dropdownOption);
      }
    });

    if (observationOptions.length) {
      observationAndInterventionOptions.value.push({
        label: t('observation.plural'),
        items: observationOptions,
      } as groupOption);
    }

    if (interventionOptions.length) {
      observationAndInterventionOptions.value.push({
        label: t('intervention.plural'),
        items: interventionOptions,
      } as groupOption);
    }

    // Filter preselect all observations and interventions
    filterObservationAndIntervention.value = [
      ...observationOptions,
      ...interventionOptions,
    ].map((option: dropdownOption) => option.value);
  }

  async function listTimeline(): Promise<void> {
    await calendarApi
      .getStudyTimeline(
        props.studyId,
        filterParticipant.value,
        filterStudyGroup.value,
        filterRelativeStartDate.value,
        studyStartDate,
        studyEndDate,
      )
      .then((response: AxiosResponse<StudyTimeline>) => {
        setupEventsList(response.data);
        setupObservationAndInterventionFilterOptions(response.data);
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list studyTimeline');
      });
  }

  async function listParticipant(): Promise<void> {
    participantsList = await participantsApi
      .listParticipants(props.studyId)
      .then((response) => {
        participantOptions.value.push(
          ...response.data.map(
            (p) =>
              ({
                label: p.alias,
                value: p.participantId?.toString(),
              }) as dropdownOption,
          ),
        );

        return response.data;
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participants');
        return participantsList;
      });
  }

  async function getFactories() {
    const observationTypes = await componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);

    const interventionTypes = await componentsApi
      .listComponents(ListComponentsComponentTypeEnum.Trigger)
      .then((response: any) => response.data);

    return [...observationTypes, ...interventionTypes];
  }

  listTimeline();
  listParticipant();
</script>

<template>
  <div class="title w-full">
    <div class="flex flex-row justify-between">
      <h3 class="mb-1 font-bold">Filter</h3>
      <Button icon="pi pi-filter-slash" @click="clearAllFilters"></Button>
    </div>
    <div class="mb-3 flex gap-5">
      <div>
        {{ $t('timeline.labels.relativeDate') }}:
        <Calendar
          v-model="filterRelativeStartDate"
          :min-date="new Date(studyStore.study.plannedStart as string)"
          :max-date="new Date(studyStore.study.plannedEnd as string)"
          autocomplete="off"
          :date-format="$t('dateFormat')"
          :placeholder="$t('dateFormat')"
          @date-select="listTimeline"
        />
      </div>
      <div>
        {{ $t('studyGroup.singular') }}:
        <Dropdown
          v-model="filterStudyGroup"
          :options="studyGroupOptions"
          option-label="label"
          option-value="value"
          :placeholder="$t('studyGroup.placeholder.chooseGroup')"
          class="ml-1"
          :disabled="filterParticipant !== undefined"
          @change="onStudyGroupFilterChange"
        />
      </div>
      <div>
        {{ $t('participants.singular') }}:
        <Dropdown
          v-model="filterParticipant"
          :options="participantOptions"
          option-label="label"
          option-value="value"
          :placeholder="$t('participants.placeholder.chooseParticipant')"
          class="ml-1"
          filter
          @change="onParticipantFilterChange"
        />
      </div>
      <div>
        {{ $t('timeline.labels.type') }}:
        <MultiSelect
          v-model="filterObservationAndIntervention"
          :options="observationAndInterventionOptions"
          option-group-label="label"
          option-group-children="items"
          option-label="label"
          option-value="value"
          :placeholder="$t('timeline.labels.chooseType')"
          class="ml-1"
          :max-selected-labels="1"
          :selected-items-label="`{0} ${$t(
            'global.placeholder.optionsSelected',
          )}`"
        ></MultiSelect>
      </div>
    </div>
  </div>

  <VueCal
    :disable-views="['years', 'year']"
    :selected-date="selectedDate"
    :locale="locale"
    :events="events"
    :on-event-click="onEventClick"
    :min-date="studyStartDate"
    :max-date="studyEndDate"
    :show-all-day-events="'short'"
    :events-on-month-view="'short'"
    overlaps-per-time-step
    :min-event-width="30"
    today-button
  >
    <template #event="{ event }">
      <div class="vuecal__event-title">
        {{ event.title }}
        <span
          v-if="
            !event.allDay &&
            !['participant-joined', 'intervention'].includes(event.class)
          "
          class="pi mr-0.5"
          :class="event.cHidden ? 'pi-eye-slash' : 'pi-eye'"
        >
        </span>
      </div>
      <div
        v-if="!event.allDay && event.class !== 'participant-joined'"
        class="vuecal__event-time"
      >
        <span>{{ event.start.formatTime('HH:mm') }}</span>
        <span
          v-if="!['participant-joined', 'intervention'].includes(event.class)"
        >
          - {{ event.end.formatTime('HH:mm') }}</span
        >
      </div>
    </template>
    <template #today-button>
      <Button
        icon="pi pi-calendar"
        :title="t('timeline.labels.today')"
      ></Button>
    </template>
  </VueCal>

  <DynamicDialog></DynamicDialog>
</template>

<style scoped lang="postcss">
  .vuecal :deep(.vuecal__event) {
    &.observation {
      background-color: var(--green-100);
      border: 1px solid var(--primary-200);
    }
    &.intervention {
      background-color: var(--yellow-100);
      border: 1px solid var(--primary-200);
    }
    &.study-date {
      background-color: var(--primary-500);
      color: white;
    }
    &.study-range {
      background-color: var(--primary-200);
      color: white;
    }
    &.participant-joined {
      background-color: var(--red-600);
      color: white;
    }
  }
</style>

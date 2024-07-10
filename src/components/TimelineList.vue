/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import VueCal, { Event, VueCalEvent } from 'vue-cal';
  import 'vue-cal/dist/vuecal.css';
  import { useI18n } from 'vue-i18n';
  import { computed, ComputedRef, PropType, ref, Ref } from 'vue';
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
  import { GroupOption, EventDetail, EventOptions } from '../models/Timeline';
  import { useGlobalStore } from '../stores/globalStore';
  import { DropdownOption } from '../models/Common';
  const dialog = useDialog();
  const dateFormat = useGlobalStore().getDateFormat;
  const { t, locale } = useI18n();
  const studyStore = useStudyStore();
  const { calendarApi } = useCalendarApi();
  const { participantsApi } = useParticipantsApi();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();

  const props = defineProps({
    studyId: { type: Number, required: true },
    studyGroups: { type: Array as PropType<Array<StudyGroup>>, required: true },
  });

  const vueCalLocale = locale.value.split('-')[0];
  const filterRelativeStartDate = ref();
  const filterStudyGroup = ref();
  const filterParticipant = ref();
  const filterObservationAndIntervention = ref();
  // We differ between EventDetail (with more data for the dialog) and Event (prop for the VueCal component)
  const timelineEventsList: Ref<Event[]> = ref([]);
  const eventToEventDetailMapper: Record<string, EventDetail> = {};
  const factories: ComponentFactory[] = await getFactories();
  const observationAndInterventionOptions: Ref<GroupOption[]> = ref([]);
  let participantsList: Participant[] = [];

  const studyStartDate =
    studyStore.study.start ?? studyStore.study.plannedStart;
  const studyEndDate = studyStore.study.end ?? studyStore.study.plannedEnd;

  let selectedDate = dateToDateString(new Date());
  if (selectedDate && studyEndDate && selectedDate > studyEndDate) {
    selectedDate = studyEndDate;
  } else if (selectedDate && studyStartDate && selectedDate < studyStartDate) {
    selectedDate = studyStartDate;
  }

  const participantOptions: Ref<DropdownOption[]> = ref([
    {
      label: t('participants.placeholder.allParticipants'),
      value: undefined,
    } as DropdownOption,
  ]);

  const studyGroupOptions: Ref<DropdownOption[]> = ref([
    {
      label: t('global.placeholder.entireStudy'),
      value: undefined,
    } as DropdownOption,
  ]);

  studyGroupOptions.value.push(
    ...props.studyGroups.map(
      (studyGroup) =>
        ({
          label: studyGroup.title,
          value: studyGroup.studyGroupId?.toString(),
        }) as DropdownOption,
    ),
  );

  const events: ComputedRef<Event[]> = computed(() => {
    return timelineEventsList.value.filter((event: Event) => {
      const eventDetail = getEventDetailByEventCid(event.cId);
      return (
        eventDetail?.options.includes(EventOptions.ignoreFilter) ||
        filterObservationAndIntervention.value.includes(eventDetail?.type)
      );
    });
  });

  function getEventDetailByEventCid(cId: string): EventDetail | undefined {
    return eventToEventDetailMapper[cId];
  }

  function setupEventsList(rsData: StudyTimeline): void {
    timelineEventsList.value = [];

    addStudyStartEvent();
    addStudyDurationEvent(rsData);
    addParticipantJoinedEvent(rsData);
    addObservationEvents(rsData);
    addInterventionEvents(rsData);
    addStudyEndEvent();
  }

  function addStudyStartEvent(): void {
    const studyStartEvent: Event = {
      start: new Date(studyStartDate as string),
      end: new Date(studyStartDate as string),
      title: studyStore.study.start
        ? t('timeline.labels.studyStart')
        : t('timeline.labels.plannedStart'),
      class: 'study-date',
      allDay: true,
      cId: 'study-date',
    };
    eventToEventDetailMapper[studyStartEvent.cId] = {
      ...studyStartEvent,
      options: [EventOptions.ignoreFilter],
    } as EventDetail;
    timelineEventsList.value.push(studyStartEvent);
  }

  function addStudyDurationEvent(rsData: StudyTimeline): void {
    if (rsData.studyDuration) {
      const studyDurationEvent: Event = {
        start: new Date(rsData.studyDuration.from as string),
        end: new Date(rsData.studyDuration.to as string),
        title: t('timeline.labels.study'),
        class: 'study-range',
        allDay: true,
        cId: 'study-range',
      };
      eventToEventDetailMapper[studyDurationEvent.cId] = {
        ...studyDurationEvent,
        options: [EventOptions.ignoreFilter],
      } as EventDetail;
      timelineEventsList.value.push(studyDurationEvent);
    }
  }

  function addParticipantJoinedEvent(rsData: StudyTimeline): void {
    if (rsData.participantSignup) {
      const participantJoinedEvent = {
        start: new Date(rsData.participantSignup as string),
        end: new Date(
          new Date(rsData.participantSignup).getTime() + 30 * 60000,
        ),
        title: t('timeline.labels.participantJoined'),
        class: 'participant-joined',
        cId: 'participant-joined',
      };
      eventToEventDetailMapper[participantJoinedEvent.cId] = {
        ...participantJoinedEvent,
        options: [
          EventOptions.showDialogInformation,
          EventOptions.ignoreFilter,
        ],
      } as EventDetail;
      timelineEventsList.value.push(participantJoinedEvent);
    }
  }

  function addObservationEvents(rsData: StudyTimeline): void {
    rsData.observations?.forEach(
      (observation: ObservationTimelineEvent, idx: number) => {
        const observationsEvent: Event = {
          start: new Date(observation.start ?? ''),
          end: new Date(observation.end ?? ''),
          title: observation.title,
          class: 'observation',
          cId: `observation-${idx}`,
        };
        eventToEventDetailMapper[observationsEvent.cId] = {
          ...observationsEvent,
          isHidden: observation.hidden,
          scheduleType: t(`scheduler.type.${observation.scheduleType}`),
          typeTranslation: getTranslationByObservationOrInterventionType(
            observation.type,
          ),
          type: observation.type ?? '',
          purpose: observation.purpose ?? '',
          options: [
            EventOptions.showEyeIcon,
            EventOptions.showDialogInformation,
            EventOptions.showEndDateInDialog,
            EventOptions.showStartTime,
            EventOptions.showEndTime,
          ],
        } as EventDetail;
        timelineEventsList.value.push(observationsEvent);
      },
    );
  }

  function addInterventionEvents(rsData: StudyTimeline): void {
    rsData.interventions?.forEach(
      (intervention: InterventionTimelineEvent, idx: number) => {
        const interventionEvent: Event = {
          start: new Date(intervention.start ?? ''),
          end: new Date(
            new Date(intervention.start ?? '').getTime() + 30 * 60000,
          ),
          title: intervention.title,
          class: 'intervention',
          cId: `intervention-${idx}`,
        };
        eventToEventDetailMapper[interventionEvent.cId] = {
          ...interventionEvent,
          typeTranslation: getTranslationByObservationOrInterventionType(
            intervention.scheduleType,
          ),
          type: intervention.scheduleType ?? '',
          purpose: intervention.purpose ?? '',
          options: [
            EventOptions.showDialogInformation,
            EventOptions.showStartTime,
          ],
        } as EventDetail;
        timelineEventsList.value.push(interventionEvent);
      },
    );
  }

  function addStudyEndEvent(): void {
    const studyEndEvent: Event = {
      start: new Date(studyEndDate as string),
      end: new Date(studyEndDate as string),
      title: studyStore.study.end
        ? t('timeline.labels.studyEnd')
        : t('timeline.labels.plannedEnd'),
      class: 'study-date',
      allDay: true,
      cId: 'study-date',
    };
    eventToEventDetailMapper[studyEndEvent.cId] = {
      ...studyEndEvent,
      options: [EventOptions.ignoreFilter],
    } as EventDetail;
    timelineEventsList.value.push(studyEndEvent);
  }

  function getTranslationByObservationOrInterventionType(
    type: string | undefined,
  ): string {
    let translation = '';
    for (let i = 0, len = factories.length; i < len; i++) {
      if (factories[i].componentId === type) {
        if (factories[i].title) {
          translation = t(factories[i].title as string);
          break;
        }
      }
    }

    return translation;
  }

  function onStudyGroupFilterChange(e: DropdownChangeEvent): void {
    const filteredOptions: DropdownOption[] = [];
    const filteredParticipants: Participant[] = [];

    filteredOptions.push({
      label: t('participants.placeholder.allParticipants'),
      value: undefined,
    } as DropdownOption);

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
        (filteredParticipant) =>
          ({
            label: filteredParticipant.alias,
            value: filteredParticipant.participantId?.toString(),
          }) as DropdownOption,
      ),
    );

    participantOptions.value = filteredOptions;
    listTimeline();
  }

  function onParticipantFilterChange(e: DropdownChangeEvent): void {
    filterStudyGroup.value = getStudyGroupIdByParticipantId(parseInt(e.value));
    listTimeline();
  }

  function onEventClick(vueCalEvent: VueCalEvent, e: MouseEvent): void {
    const eventDetail: EventDetail | undefined = getEventDetailByEventCid(
      vueCalEvent.cId,
    );

    if (!eventDetail?.options.includes(EventOptions.showDialogInformation)) {
      return;
    }
    dialog.open(TimelineDialog, {
      data: {
        eventDetail: eventDetail,
      },
      props: {
        header: eventDetail.title,
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

  function clearAllFilters(): void {
    filterRelativeStartDate.value = undefined;
    filterStudyGroup.value = undefined;
    filterParticipant.value = undefined;
    filterObservationAndIntervention.value = [];
    listTimeline();
  }

  function setupObservationAndInterventionFilterOptions(
    rsData: StudyTimeline,
  ): void {
    observationAndInterventionOptions.value = [];
    const observationOptions: DropdownOption[] = [];
    const interventionOptions: DropdownOption[] = [];

    rsData.observations?.forEach((observation: ObservationTimelineEvent) => {
      const existingOption = observationOptions.some(
        (option: DropdownOption) => option.value === observation.type,
      );

      if (!existingOption) {
        observationOptions.push({
          label: getTranslationByObservationOrInterventionType(
            observation.type,
          ),
          value: observation.type,
        } as DropdownOption);
      }
    });
    rsData.interventions?.forEach((intervention: InterventionTimelineEvent) => {
      const existingOption = interventionOptions.some(
        (option: DropdownOption) => option.value === intervention.scheduleType,
      );

      if (!existingOption) {
        interventionOptions.push({
          label: getTranslationByObservationOrInterventionType(
            intervention.scheduleType,
          ),
          value: intervention.scheduleType,
        } as DropdownOption);
      }
    });

    if (observationOptions.length) {
      observationAndInterventionOptions.value.push({
        label: t('observation.plural'),
        items: observationOptions,
      } as GroupOption);
    }

    if (interventionOptions.length) {
      observationAndInterventionOptions.value.push({
        label: t('intervention.plural'),
        items: interventionOptions,
      } as GroupOption);
    }

    // Filter preselect all observations and interventions
    filterObservationAndIntervention.value = [
      ...observationOptions,
      ...interventionOptions,
    ].map((option: DropdownOption) => option.value);
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
        console.log(e);
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
              }) as DropdownOption,
          ),
        );

        return response.data;
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participants');
        return participantsList;
      });
  }

  async function getFactories(): Promise<ComponentFactory[]> {
    const observationTypes: ComponentFactory[] = await componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);

    const interventionTypes: ComponentFactory[] = await componentsApi
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
      <Button icon="pi pi-filter-slash" @click="clearAllFilters" />
    </div>
    <div class="mb-3 flex gap-5">
      <div>
        <span>{{ $t('timeline.labels.relativeDate') }}:</span>
        <span
          v-tooltip.bottom="$t('tooltips.timeline.relativeDateInfo')"
          class="pi pi-info-circle color-primary mx-1"
        ></span>
        <Calendar
          v-model="filterRelativeStartDate"
          :min-date="new Date(studyStore.study.plannedStart as string)"
          :max-date="new Date(studyStore.study.plannedEnd as string)"
          autocomplete="off"
          :date-format="dateFormat"
          :placeholder="dateFormat"
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
    :locale="vueCalLocale"
    :events="events"
    :on-event-click="onEventClick"
    :min-date="studyStartDate"
    :max-date="studyEndDate"
    show-all-day-events="short"
    events-on-month-view="short"
    overlaps-per-time-step
    :min-event-width="30"
    today-button
  >
    <template #event="{ event }">
      <div class="vuecal__event-title">
        {{ event.title }}
        <span
          v-if="
            getEventDetailByEventCid(event.cId)?.options.includes(
              EventOptions.showEyeIcon,
            )
          "
          class="pi mr-0.5"
          :class="
            getEventDetailByEventCid(event.cId)?.isHidden
              ? 'pi-eye-slash'
              : 'pi-eye'
          "
        >
        </span>
      </div>
      <div
        v-if="
          getEventDetailByEventCid(event.cId)?.options.includes(
            EventOptions.showStartTime,
          )
        "
        class="vuecal__event-time"
      >
        <span>{{ event.start.formatTime('HH:mm') }}</span>
        <span
          v-if="
            getEventDetailByEventCid(event.cId)?.options.includes(
              EventOptions.showEndTime,
            )
          "
        >
          - {{ event.end.formatTime('HH:mm') }}</span
        >
      </div>
    </template>
    <template #today-button>
      <Button icon="pi pi-calendar" :title="t('timeline.labels.today')" />
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

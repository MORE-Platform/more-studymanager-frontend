<script setup lang="ts">
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import { computed, ComputedRef, onBeforeMount, onBeforeUnmount, Ref, ref } from 'vue';
  import { DropdownOption } from '../../models/Common';
  import { ComponentFactory, Observation, Participant } from '@gs';
  import { AxiosError, AxiosResponse } from 'axios';
  import {
    useComponentsApi,
    useObservationsApi,
    useParticipantsApi,
  } from '../../composable/useApi';
  import { useStudyGroupStore } from '../../stores/studyGroupStore';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../../composable/useErrorHandling';
  import { useStudyStore } from '../../stores/studyStore';
  import { useGlobalStore } from '../../stores/globalStore';
  import MultiSelect from 'primevue/multiselect';
  import { DownloadDataFilter } from '../../models/DataDownloadModel';
  import ProgressSpinner from 'primevue/progressspinner';
  import { useDialog } from 'primevue/usedialog';
  import ConfirmationDialog from '../dialog/ConfirmationDialog.vue';
  import { onBeforeRouteLeave, useRouter } from 'vue-router';

  const dialog = useDialog();
  const router = useRouter();
  const pendingRoute = ref<any>(null);

  const { t } = useI18n();
  const { componentsApi } = useComponentsApi();
  const { observationsApi } = useObservationsApi();
  const { handleIndividualError } = useErrorHandling();
  const dateFormat = useGlobalStore().getDateFormat;
  const { participantsApi } = useParticipantsApi();
  const studyGroupStore = useStudyGroupStore();
  const studyStore = useStudyStore();

  const observationList: Ref<Observation[]> = ref([]);
  let factories: ComponentFactory[] = await getFactories();
  const filterDateRange = ref();

  const filterStudyGroup = ref([]);
  const filterParticipant = ref([]);
  const filterObservation = ref([]);
  const observationOptions: ComputedRef<DropdownOption[]> = computed(() => {
    return observationList.value.map((observation) => {
      return {
        label: `${observation.title} (${getObservationName(observation.type as string)})`,
        value: observation.observationId?.toString() || null,
      } as DropdownOption;
    });
  });

  function getObservationName(type: string): string {
    return t(factories.find((f) => type === f.componentId)?.title as string);
  }

  const studyGroupOptions: Ref<DropdownOption[]> = ref([]);

  studyGroupOptions.value.push(
    ...studyGroupStore.studyGroups.map(
      (studyGroup) =>
        ({
          label: studyGroup.title,
          value: studyGroup.studyGroupId?.toString(),
        }) as DropdownOption,
    ),
  );

  let participantsList: Participant[] = [];
  const participantOptions: Ref<DropdownOption[]> = ref([]);

  function clearAllFilters(): void {
    filterParticipant.value = [];
    filterObservation.value = [];
    filterStudyGroup.value = [];
    filterDateRange.value = undefined;
  }

  const isAnyFilterActive: ComputedRef<boolean> = computed((): boolean => {
    return (
      filterParticipant.value.length > 0 ||
      filterObservation.value.length > 0 ||
      filterStudyGroup.value.length > 0 ||
      filterDateRange.value !== undefined
    );
  });

  async function getObservationList(): Promise<void> {
    await observationsApi
      .listObservations(studyStore.studyId)
      .then((response: AxiosResponse) => {
        observationList.value = response.data;
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot list observations'),
      );
  }

  async function fetchParticipants(): Promise<void> {
    participantsList = await participantsApi
      .listParticipants(studyStore.studyId)
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

  function loadData(): void {
    fetchParticipants();
    getObservationList();
  }

  const isDownloadDataLoading = ref<boolean>(false)
  function downloadStudyData(): void {
    isDownloadDataLoading.value = true
    studyStore.exportStudyData({
      studyId: studyStore.studyId,
      ...getDownloadFilters(),
    }).then(() => {
      isDownloadDataLoading.value = false
    });
  }

  function getDownloadFilters(): DownloadDataFilter {
    const filterValues = {
      studyGroupId: filterStudyGroup.value ?? undefined,
      participantId: filterParticipant.value ?? undefined,
      observationId: filterObservation.value ?? undefined,
      from: undefined,
      to: undefined,
    };

    if (filterDateRange.value && filterDateRange.value.length > 1) {
      filterValues.from = filterDateRange.value[0];
      const toDate = filterDateRange.value[1];
      toDate.setHours(23, 59, 59);
      filterValues.to = toDate;
    }

    return filterValues;
  }

  const disableStudyGroupFilter: ComputedRef<boolean> = computed(() => {
    return filterParticipant.value.length > 0;
  });

  const disableParticipantFilter: ComputedRef<boolean> = computed(() => {
    return filterStudyGroup.value.length > 0;
  });

  async function getFactories(): Promise<ComponentFactory[]> {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }

  componentsApi
    .listComponents('observation')
    .then((response: any) => response.data)
    .then((rs) => (factories = rs))
    .then(loadData);

  function interceptPageNavigation(): void {
    dialog.open(ConfirmationDialog, {
      data: {
        message: t('monitoringData.dialog.msg.downloadStudyData'),
        cancelBtn: t('monitoringData.dialog.waitForDownload'),
        approveBtn: t('monitoringData.dialog.navigatePage')
      },
      props: {
        header: t('monitoringData.dialog.header.downloadStudyData'),
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
      },
      onClose: (options) =>{
        if (options?.data) {
          if (pendingRoute.value) {
            isDownloadDataLoading.value = false
            router.push(pendingRoute.value)
          }
        }
        pendingRoute.value = null
      }
    })
  }

  onBeforeRouteLeave((to, from, next) => {
    if (isDownloadDataLoading.value) {
      pendingRoute.value = to
      interceptPageNavigation()
      // preventNavigation
      next(false)
    } else {
      // navigate
      next()
    }
  })

  onBeforeMount(() => {
    window.addEventListener('beforeunload', (e) => {
      if (isDownloadDataLoading.value) e.preventDefault() }
    )
  })
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', (e) => {
      if (isDownloadDataLoading.value) e.preventDefault() }
    )
  })
</script>

<template>
  <div>
    <div class="title mb-8">
      <h3 class="mb-1 font-bold">
        {{ $t('data.dataDownload.title') }}
      </h3>
      <div>
        {{ $t('data.dataDownload.description') }}
      </div>
    </div>
    <div class="flex justify-between">
      <h3 class="mb-1 font-bold">{{ $t('global.labels.filter') }}</h3>
      <Button
        icon="pi pi-filter-slash"
        :disabled="!isAnyFilterActive"
        @click="clearAllFilters"
      />
    </div>
    <div class="mb-3 flex flex-row items-center justify-between gap-5">
      <div class="flex gap-5">
        <div class="flex flex-row items-center">
          {{ $t('monitoring.labels.dateRange') }}:
          <Calendar
            v-model="filterDateRange"
            :min-date="new Date(studyStore.study.plannedStart as string)"
            autocomplete="off"
            selection-mode="range"
            :manual-input="false"
            :date-format="dateFormat"
            :placeholder="`${dateFormat} - ${dateFormat}`"
          />
        </div>
        <div class="flex flex-row items-center">
          {{ $t('studyGroup.plural') }}:
          <MultiSelect
            v-model="filterStudyGroup"
            :options="studyGroupOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('studyGroup.placeholder.chooseGroup')"
            class="ml-1"
            :disabled="disableStudyGroupFilter"
            :empty-message="$t('global.labels.noRecords')"
            :max-selected-labels="1"
            :selected-items-label="`{0} ${$t(
              'global.placeholder.optionsSelected',
            )}`"
          />
        </div>
        <div class="flex flex-row items-center">
          {{ $t('participants.plural') }}:
          <MultiSelect
            v-model="filterParticipant"
            :options="participantOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('participants.placeholder.chooseParticipant')"
            class="ml-1"
            filter
            :disabled="disableParticipantFilter"
            :empty-message="$t('global.labels.noRecords')"
            :max-selected-labels="1"
            :selected-items-label="`{0} ${$t(
              'global.placeholder.optionsSelected',
            )}`"
          />
        </div>
        <div class="flex flex-row items-center">
          {{ $t('observation.plural') }}:
          <MultiSelect
            v-model="filterObservation"
            :options="observationOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('timeline.labels.chooseType')"
            class="ml-1"
            :empty-message="$t('global.labels.noRecords')"
            :max-selected-labels="0"
            :selected-items-label="`{0} ${$t(
              'global.placeholder.optionsSelected',
            )}`"
          ></MultiSelect>
        </div>
      </div>
    </div>
    <div class="flex justify-end">
      <Button
        icon="pi pi-download"
        class="mt-8"
        :label="$t('study.studyList.labels.exportStudyData')"
        :disabled="isDownloadDataLoading"
        @click="downloadStudyData()"
      >
        <span class="p-button-icon p-button-icon-left pi pi-download"></span>
      <span>{{t('study.studyList.labels.exportStudyData')}}</span>
        <ProgressSpinner
          v-if="isDownloadDataLoading"
          class="!text-white ml-2"
          style="width: 25px; height: 25px"
          stroke-width="6"
          fill="transparent"
          animation-duration=".5s"
        />
      </Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  :deep(.p-progress-spinner-circle) {
    stroke: currentColor!important;
  }
</style>

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import Dropdown, { DropdownChangeEvent } from 'primevue/dropdown';
  import Accordion from 'primevue/accordion';
  import AccordionTab from 'primevue/accordiontab';
  import Chart from 'primevue/chart';
  import TabView from 'primevue/tabview';
  import TabPanel from 'primevue/tabpanel';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import {
    useComponentsApi,
    useDataApi,
    useParticipantsApi,
  } from '../composable/useApi';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { computed, ComputedRef, ref, Ref, watch } from 'vue';
  import {
    ChartProperties,
    ObservationDataViewInfo,
    ObservationDataViewDataDTO,
    ObservationDataViewDataRow,
    ObservationDataViewFilter,
    ParticipationDataGrouping,
    ParticipationDataMapping,
    ObservationsViewData,
    ObservationDataViewData,
  } from '../models/ParticipationData';
  import { AxiosError, AxiosResponse } from 'axios';
  import {
    MoreTableColumn,
    MoreTableFieldType,
    MoreTableSortOptions,
  } from '../models/MoreTableModel';
  import MoreTable from '../components/shared/MoreTable.vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useStudyStore } from '../stores/studyStore';
  import { useGlobalStore } from '../stores/globalStore';
  import { DropdownOption } from '../models/Common';
  import { useStudyGroupStore } from '../stores/studyGroupStore';
  import useLoader from '../composable/useLoader';
  import { ComponentFactory, Participant } from '@/gs/models';

  const { t, d } = useI18n();
  const { handleIndividualError } = useErrorHandling();
  const loader = useLoader();
  const { componentsApi } = useComponentsApi();
  const { participantsApi } = useParticipantsApi();
  const { dataApi } = useDataApi();
  const dateFormat = useGlobalStore().getDateFormat;
  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
  });

  const sortOptions: MoreTableSortOptions = {
    sortField: 'lastDataReceived',
    sortOrder: -1,
  };

  const filterDateRange = ref();
  watch(filterDateRange, () => {
    // Only apply filter if there is a "from" and "to" date value available
    if (filterDateRange.value?.every((v: Date | null) => v !== null)) {
      applyFilter();
    }
  });
  const filterStudyGroup = ref();
  const filterParticipant = ref();

  const studyGroupOptions: Ref<DropdownOption[]> = ref([
    {
      label: t('global.placeholder.entireStudy'),
      value: undefined,
    } as DropdownOption,
  ]);

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
  const participantOptions: Ref<DropdownOption[]> = ref([
    {
      label: t('participants.placeholder.allParticipants'),
      value: undefined,
    } as DropdownOption,
  ]);

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
    applyFilter();
  }

  function onParticipantFilterChange(e: DropdownChangeEvent): void {
    filterStudyGroup.value = getStudyGroupIdByParticipantId(parseInt(e.value));
    applyFilter();
  }

  const isVisualizationTabActive: Ref<boolean> = ref(false);
  /**
   * Initial value is true, because :active-index="0" at the Accordion component,
   * opens the first accordion by default.
   */
  const isAnyAccordionOpen: Ref<boolean> = ref(true);

  const disableVisualizationFilter = computed(() => {
    return !isVisualizationTabActive.value || !isAnyAccordionOpen.value;
  });

  function onAccordionIndexChange(index: number | undefined): void {
    if (index !== undefined && isVisualizationTabActive.value) {
      // Change from active accordion and visualization tab open to another accordion,
      // where the first tab (table) is displayed by default
      isAnyAccordionOpen.value = true;
      isVisualizationTabActive.value = false;
    } else {
      isAnyAccordionOpen.value = index !== undefined;
    }
  }

  function onTabChange(observationId: number, tabIndex: number): void {
    // Tabs: Table == 0, Visualization == 1
    isVisualizationTabActive.value = tabIndex === 1;

    if (tabIndex === 0) {
      // "Table" Tab is active (no chart)
      return;
    }

    if (
      observationsViewData.value[observationId].selectedView &&
      observationsViewData.value[observationId].data[
        observationsViewData.value[observationId].selectedView
      ].chartData !== null
    ) {
      // chart data already available - skip
      return;
    }
    if (observationsViewData.value[observationId].selectedView) {
      fetchObservationViewData(
        +observationId,
        observationsViewData.value[observationId].selectedView,
        getViewDataFilters(),
      );
    }
  }

  function onViewOptionChange(
    e: DropdownChangeEvent,
    observationId: number,
  ): void {
    if (e.value) {
      if (
        observationsViewData.value[observationId].selectedView &&
        observationsViewData.value[observationId].data[
          observationsViewData.value[observationId].selectedView
        ].chartData !== null
      ) {
        // chart data already available - skip
        return;
      }
      fetchObservationViewData(+observationId, e.value, getViewDataFilters());
    }
  }

  function clearAllFilters(): void {
    filterParticipant.value = undefined;
    filterStudyGroup.value = undefined;
    filterDateRange.value = undefined;
    applyFilter();
  }

  const isAnyFilterActive: ComputedRef<boolean> = computed((): boolean => {
    return (
      filterParticipant.value !== undefined ||
      filterStudyGroup.value !== undefined ||
      filterDateRange.value !== undefined
    );
  });

  function getStudyGroupIdByParticipantId(id: number): string | undefined {
    const foundParticipant = participantsList.find(
      (p) => p.participantId === id,
    );

    return foundParticipant?.studyGroupId?.toString();
  }

  function getUniqueObservationIds(
    data: ParticipationDataMapping[],
  ): Set<number> {
    const uniqueIds = new Set<number>();

    data.forEach((item) => {
      uniqueIds.add(item.observationId);
    });

    return uniqueIds;
  }

  function applyFilter(): void {
    for (const observationId in observationsViewData.value) {
      for (const viewName in observationsViewData.value[observationId].data) {
        if (
          observationsViewData.value[observationId].data[viewName].chartType !==
          null
        ) {
          fetchObservationViewData(
            +observationId,
            viewName,
            getViewDataFilters(),
          );
        }
      }
    }
  }

  function getViewDataFilters(): ObservationDataViewFilter {
    const fromDate = filterDateRange.value
      ? filterDateRange.value[0]
      : undefined;
    const toDate = filterDateRange.value ? filterDateRange.value[1] : undefined;

    if (fromDate && toDate && fromDate.getTime() === toDate.getTime()) {
      // If we only filter for one day, we need the whole day until the end
      toDate.setHours(23, 23, 59);
    }
    return {
      studyGroupId: filterStudyGroup.value
        ? +filterStudyGroup.value
        : undefined,
      participantId: filterParticipant.value
        ? +filterParticipant.value
        : undefined,
      from: fromDate,
      to: toDate,
    };
  }

  function convertChartTypeData(
    observationDataViewData: ObservationDataViewDataDTO,
  ): ChartProperties | null {
    if (!observationDataViewData.data?.length) {
      return null;
    }

    switch (observationDataViewData.chartType) {
      case 'pie':
        return transformToPieChartData(observationDataViewData);
      case 'line':
        return transformToLineChartData(observationDataViewData);
      case 'bar':
        return transformToBarChartData(observationDataViewData);
      default:
        console.log(
          `Unsupported Chart type: ${observationDataViewData.chartType}`,
        );
        return null;
    }
  }

  function transformToPieChartData(
    observationDataViewData: ObservationDataViewDataDTO,
  ): ChartProperties {
    return {
      type: 'pie',
      data: {
        labels: transformLabels(observationDataViewData.labels),
        datasets: [
          {
            data: observationDataViewData.data[0].values,
          },
        ],
      },
      options: getChartOptions(observationDataViewData.view),
    } as ChartProperties;
  }

  function transformToLineChartData(
    observationDataViewData: ObservationDataViewDataDTO,
  ): ChartProperties {
    return {
      type: 'line',
      data: {
        labels: transformLabels(observationDataViewData.labels),
        datasets: createDataSet(observationDataViewData.data),
      },
      options: getChartOptions(observationDataViewData.view),
    } as ChartProperties;
  }

  function transformToBarChartData(
    observationDataViewData: ObservationDataViewDataDTO,
  ): ChartProperties {
    const additionalChartOptions = {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    };

    return {
      type: 'bar',
      data: {
        labels: transformLabels(observationDataViewData.labels),
        datasets: createDataSet(observationDataViewData.data),
      },
      options: getChartOptions(
        observationDataViewData.view,
        additionalChartOptions,
      ),
    } as ChartProperties;
  }

  function getChartOptions(
    view: ObservationDataViewInfo,
    additionalOptions?: any,
  ): any {
    return {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: t(view.title),
        },
        subtitle: {
          display: true,
          text: t(view.description),
        },
      },
      ...additionalOptions,
    };
  }

  function transformLabels(labels: string[]): string[] | null {
    return labels?.map((label) => {
      if (isValidDateTimeFormat(label)) {
        return d(new Date(label), 'long');
      } else if (label.startsWith('i18n.')) {
        const key = label.substring(5);
        return t(key);
      }
      return label;
    });
  }

  function isValidDateTimeFormat(dateTimeString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?[+-]\d{4}$/;
    return regex.test(dateTimeString);
  }

  function createDataSet(
    data: ObservationDataViewDataRow[],
  ): { label: string[] | null; data: number[] }[] {
    const obj = groupAndAggregateValues(data);
    const dataSets = [];
    for (const [key, values] of Object.entries(obj)) {
      dataSets.push({
        label: transformLabels([key]),
        data: values,
      });
    }

    return dataSets;
  }

  function groupAndAggregateValues(data: ObservationDataViewDataRow[]): {
    [key: string]: number[];
  } {
    return data.reduce(
      (acc, current) => {
        if (acc[current.label]) {
          acc[current.label] = acc[current.label].concat(current.values);
        } else {
          acc[current.label] = current.values;
        }
        return acc;
      },
      {} as { [key: string]: number[] },
    );
  }

  let factories: ComponentFactory[];

  function getObservationTypeLabel(observationType: string): string {
    const label = factories.find(
      (f) => f.componentId === observationType,
    )?.title;
    return label !== undefined ? t(label) : '';
  }

  const studyDataColumns: MoreTableColumn[] = [
    {
      field: 'participantId',
      header: t('global.labels.id'),
      editable: false,
      sortable: true,
    },
    {
      field: 'participantAlias',
      header: t('participants.singular'),
      editable: false,
      sortable: true,
      filterable: true,
    },
    {
      field: 'studyGroupTitle',
      header: t('study.props.studyGroup'),
      editable: false,
      sortable: true,
      filterable: true,
    },
    {
      field: 'dataReceived',
      header: t('global.labels.dataReceived'),
      editable: false,
      sortable: true,
      filterable: true,
    },
    {
      field: 'lastDataReceived',
      header: t('global.labels.lastDataReceived'),
      editable: false,
      sortable: true,
      filterable: true,
      type: MoreTableFieldType.datetime,
    },
  ];

  const groupedParticipantData: Ref<ParticipationDataGrouping> = ref({});
  function setObservationGroups(data: ParticipationDataMapping[]): void {
    groupedParticipantData.value = data.reduce(function (prev, curr) {
      prev[curr.observationId] = prev[curr.observationId] || [];
      prev[curr.observationId].push(curr);
      return prev;
    }, Object.create(null));
  }

  async function fetchParticipants(): Promise<void> {
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

  async function fetchParticipationData(): Promise<ParticipationDataMapping[]> {
    return dataApi
      .getParticipationData(props.studyId)
      .then((response) =>
        response.data.map((item) => {
          return {
            participantId: item.participantNamedId?.id,
            participantAlias: item.participantNamedId?.title || '-',
            observationId: item.observationNamedId?.id || -1,
            observationTitle: `${item.observationNamedId?.title} ${getObservationTypeLabel(
              item.observationType as string,
            )}`,
            studyGroupTitle:
              item.studyGroupNamedId?.title ||
              t('global.placeholder.entireStudy'),
            dataReceived: t(
              `global.labels.${
                item.dataReceived ? 'dataReceived' : 'noDataReceived'
              }`,
            ),
            lastDataReceived: item.lastDataReceived
              ? item.lastDataReceived
              : '-',
          };
        }),
      )
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participationDataList');
        return [];
      });
  }

  const observationsViewData: Ref<ObservationsViewData> = ref({});
  function fetchViewsForObservation(data: ParticipationDataMapping[]): void {
    for (const observationId of getUniqueObservationIds(data)) {
      dataApi
        .listObservationViews(props.studyId, observationId)
        .then((response: AxiosResponse) => {
          if (response.data?.length > 0) {
            observationsViewData.value[observationId] = {
              selectedView: '',
              viewOptions: [],
              data: {},
            };
            response.data.forEach(
              (view: ObservationDataViewInfo, index: number) => {
                observationsViewData.value[observationId].data[view.name] = {
                  chartType: null,
                  chartData: null,
                  labels: [],
                  view: view,
                } as ObservationDataViewData;
                const option: DropdownOption = {
                  value: view.name,
                  label: t(view.label),
                };
                observationsViewData.value[observationId].viewOptions.push(
                  option,
                );

                if (index === 0) {
                  observationsViewData.value[observationId].selectedView =
                    view.name;
                }
              },
            );
          }
        })
        .catch((e: AxiosError) => {
          handleIndividualError(e, 'cannot list views for observation');
        });
    }
  }

  function fetchObservationViewData(
    observationId: number,
    viewName: string,
    filter: ObservationDataViewFilter,
  ): void {
    dataApi
      .getObservationViewData(
        props.studyId,
        observationId,
        viewName,
        filter.studyGroupId,
        filter.participantId,
        filter.from,
        filter.to,
      )
      .then((rs: AxiosResponse) => {
        observationsViewData.value[observationId].data[viewName].chartType =
          rs.data.chartType;
        observationsViewData.value[observationId].data[viewName].chartData =
          convertChartTypeData(rs.data);
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list view data for observation');
      });
  }

  let timer: ReturnType<typeof setInterval>;
  const refreshTimeInSeconds = 10;

  function loadData(): void {
    timer ??= setInterval(function () {
      fetchParticipationData().then(setObservationGroups);
    }, refreshTimeInSeconds * 1000);
    fetchParticipationData().then((data) => {
      setObservationGroups(data);
      fetchViewsForObservation(data);
    });
    fetchParticipants();
  }

  onBeforeRouteLeave(() => {
    clearInterval(timer);
  });

  componentsApi
    .listComponents('observation')
    .then((response: any) => response.data)
    .then((rs) => (factories = rs))
    .then(loadData);
</script>

<template>
  <div>
    <div v-if="Object.keys(groupedParticipantData).length">
      <div class="title mb-8">
        <h3 class="mb-1 font-bold">
          {{ $t('monitoring.dataList.title') }}
        </h3>
        <div>
          {{ $t('monitoring.dataList.description') }}
        </div>
      </div>
      <div class="flex items-center">
        <h3 class="mb-1 font-bold">{{ $t('global.labels.filter') }}</h3>
        <span
          v-tooltip.bottom="$t('monitoring.dataPointsList.filterInfo')"
          class="pi pi-info-circle color-primary mx-1"
        ></span>
      </div>

      <div class="mb-3 flex items-center justify-between gap-5">
        <div class="flex gap-5">
          <div>
            {{ $t('monitoring.labels.dateRange') }}:
            <Calendar
              v-model="filterDateRange"
              :min-date="new Date(studyStore.study.plannedStart as string)"
              autocomplete="off"
              selection-mode="range"
              :manual-input="false"
              :date-format="dateFormat"
              :placeholder="`${dateFormat} - ${dateFormat}`"
              :disabled="disableVisualizationFilter"
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
              :disabled="
                disableVisualizationFilter || filterParticipant !== undefined
              "
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
              :disabled="disableVisualizationFilter"
              class="ml-1"
              filter
              @change="onParticipantFilterChange"
            />
          </div>
        </div>
        <div>
          <Button
            icon="pi pi-filter-slash"
            :disabled="disableVisualizationFilter || !isAnyFilterActive"
            @click="clearAllFilters"
          />
        </div>
      </div>

      <Accordion
        :active-index="0"
        lazy
        expand-icon="pi pi-chevron-up"
        @update:active-index="onAccordionIndexChange"
      >
        <AccordionTab
          v-for="(observationData, observationId) in groupedParticipantData"
          :key="observationId"
          :header="observationData[0].observationTitle"
          headerClass="mt-2.5"
        >
          <TabView @update:active-index="onTabChange(observationId, $event)">
            <TabPanel :header="$t('monitoring.labels.latestDataPoints')">
              <MoreTable
                v-if="observationData.length"
                row-id="observationId"
                :columns="studyDataColumns"
                :rows="observationData"
                :row-edit-btn="false"
                :sort-options="sortOptions"
                :editable="() => false"
                :empty-message="$t('monitoring.dataList.emptyListMsg')"
              />
            </TabPanel>
            <TabPanel
              v-if="observationsViewData[observationId]"
              :header="$t('monitoring.labels.visualization')"
            >
              <Dropdown
                v-model="observationsViewData[observationId].selectedView"
                :options="observationsViewData[observationId].viewOptions"
                option-label="label"
                option-value="value"
                :placeholder="
                  $t('global.placeholder.chooseDropdownOptionDefault')
                "
                @change="onViewOptionChange($event, observationId)"
              />
              <div class="flex min-h-[500px] items-center justify-center">
                <Chart
                  v-if="
                    observationsViewData[observationId].selectedView &&
                    observationsViewData[observationId].data[
                      observationsViewData[observationId].selectedView
                    ].chartData
                  "
                  v-bind="
                    observationsViewData[observationId].data[
                      observationsViewData[observationId].selectedView
                    ].chartData
                  "
                  :height="500"
                  :width="1000"
                />
                <template v-else-if="!loader.isLoading.value">
                  <h3>{{ $t('monitoring.labels.noDataAvailable') }}</h3>
                </template>
              </div>
            </TabPanel>
          </TabView>
        </AccordionTab>
      </Accordion>
    </div>
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

<style scoped lang="postcss">
  :deep(.more-table) {
    .flex {
      margin: 0;
    }
  }

  :deep(.p-accordion-header) {
    a {
      padding: 0.5rem 0 1rem 0 !important;
      font-size: 1.1rem;
      font-weight: normal;
      color: var(--primary-color) !important;
      border: transparent !important;
      border-bottom: 1px solid var(--surface-c) !important;
      background: transparent !important;

      &:focus,
      &:active {
        border: transparent !important;
      }
    }
    .p-accordion-toggle-icon {
      position: absolute;
      right: 0;
    }
  }
  :deep(.p-accordion-content) {
    border: transparent !important;
    padding: 0 !important;
  }
</style>

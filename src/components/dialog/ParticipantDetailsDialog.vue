<script setup lang="ts">
  import { computed, inject, onMounted } from 'vue';
  import Button from 'primevue/button';
  import {
    DataHealthIndicatorEnum,
    OccurredObservation,
    Participant,
    StateEnum,
  } from '@gs';
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import { DataHealthTableItem } from '../../models/DataHeaqlthTableItem';

  const studyStore = useStudyStore();
  const { t, d } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const participant: Participant = dialogRef.value.data?.participant || {};
  const studyId: number = dialogRef.value.data?.studyId || {};

  const participantObservationsInTimeline = computed(
    () => studyStore.participantTimelineObservations,
  );
  const participantOccuredObservations = computed(
    () => studyStore.occurredObservations,
  );
  const dataHealthTableItems = computed(() => mapInformationToTable());

  const studyStartDate =
    studyStore.study.start ?? studyStore.study.plannedStart;
  const studyEndDate = studyStore.study.end ?? studyStore.study.plannedEnd;

  const tableColumns = [
    {
      field: 'observationTitle',
      header: t('observation.observationList.title'),
    },
    {
      field: 'timeInfo',
      header: t('global.labels.time'),
    },
    {
      field: 'healthState',
      header: t('observation.props.dataHealth'),
    },
  ];

  function closeDialog(): void {
    dialogRef.value.close();
  }

  const dataHealthIndicatorBtn = computed(() => {
    if (participant.dataHealthIndicator) {
      switch (participant.dataHealthIndicator) {
        case DataHealthIndicatorEnum.Green:
          return 'btn-accepted';
        case DataHealthIndicatorEnum.Orange:
          return 'btn-warn';
        case DataHealthIndicatorEnum.Red:
          return 'btn-important';
        default:
          return 'btn-warn';
      }
    }
    return 'btn-warn';
  });
  const dataHealthIndicatorIcon = computed(() => {
    if (participant.dataHealthIndicator) {
      switch (participant.dataHealthIndicator) {
        case DataHealthIndicatorEnum.Green:
          return 'pi pi-check';
        case DataHealthIndicatorEnum.Orange:
          return 'pi pi-exclamation-triangle';
        case DataHealthIndicatorEnum.Red:
          return 'pi pi-times';
        default:
          return 'pi pi-exclamation-triangle';
      }
    }
    return 'pi pi-exclamation-triangle';
  });

  function getDataHealthIndicatorColor(state: StateEnum): string {
    switch (state) {
      case StateEnum.Completed:
        return 'bg-[var(--green-500)]';
      default:
        return 'bg-[var(--orange-500)]';
    }
  }
  function getDataHealthIcon(state: StateEnum): string {
    switch (state) {
      case StateEnum.Completed:
        return 'pi pi-check';
      default:
        return 'pi pi-exclamation-triangle';
    }
  }

  function mapInformationToTable(): DataHealthTableItem[] {
    const upcomingTimelineEvents = participantObservationsInTimeline.value
      ?.filter((item) => new Date(item.start as string).getTime() >= Date.now())
      .map((item) => {
        const startTs = new Date(item.start as string).getTime();
        const endTs = new Date(item.end as string).getTime();

        return {
          observationTitle: item.title,
          observationId: item.observationId,
          observationType: item.type,
          startTs,
          endTs,
          start: d(new Date(item.start as string)),
          timeInfo: formatTimeInfo(item.start as string, item.end as string),
          healthState: '-',
          upcoming: true,
        };
      })
      .sort((a, b) => b.startTs - a.startTs || b.endTs - a.endTs);

    const occurredObservationPoints =
      participantOccuredObservations.value.map((item: OccurredObservation) => ({
        observationTitle: item.observation?.title,
        observationId: item.observation?.observationId,
        observationType: item.observation?.type,
        start: d(new Date(item.start as string)),
        timeInfo: formatTimeInfo(item.start as string, item.end as string),
        healthState: item.state,
      })) ?? [];

    const merged: DataHealthTableItem[] = [
      ...upcomingTimelineEvents,
      ...occurredObservationPoints,
    ];

    return merged;
  }

  async function getObservationInformation(): Promise<void> {
    if (participant.participantId) {
      await Promise.all([
        studyStore.listOccurredObservations(studyId, participant.participantId),
        studyStore.listParticipantObservationsInTimeline(
          studyId,
          participant.participantId,
          undefined,
          undefined,
          studyStartDate,
          studyEndDate,
        ),
      ]);
    }
  }

  function formatTimeInfo(start: string, end: string): string {
    return `${d(new Date(start as string), 'long')} -
            ${
              d(new Date(end as string), 'short') ===
              d(new Date(start as string), 'short')
                ? d(new Date(end as string), 'long')
                    .toString()
                    .slice(12)
                : d(new Date(end as string), 'long')
            }`;
  }

  onMounted(() => {
    getObservationInformation();
  });
</script>

<template>
  <div class="text-base">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3>{{ participant.alias }}</h3>
        <div>Id: {{ participant.participantId }}</div>
      </div>
      <div
        v-if="participant.dataHealthIndicator"
        :class="dataHealthIndicatorBtn"
        class="flex aspect-square !w-10 items-center justify-center"
      >
        <span :class="dataHealthIndicatorIcon" class="!text-xl" />
      </div>
    </div>

    <DataTable v-if="dataHealthTableItems.length" :value="dataHealthTableItems">
      <template v-for="col in tableColumns" :key="col.field">
        <Column :field="col.field" :header="col.header" body-class="!p-0">
          <template v-if="col.field === 'healthState'" #body="{ data }">
            <div>
              <div
              >
                <span v-if="data.healthState !== '-'" class="flex items-center gap-3 w-full justify-start" >
                  <span
                    :class="[
                     getDataHealthIndicatorColor(data.healthState),
                      'flex justify-center px-2 py-2 aspect-square items-center',
                    ]">
                  <span
                    :class="getDataHealthIcon(data.healthState)"
                    class="!text-xl text-white"
                  />
                    </span>
                  <span>{{`${$t(`study.dataHealth.labels.${data.healthState}`)}`}}</span>
                </span>
                <div v-else class="px-2 py-3">
                  {{ data.healthState }}
                </div>
              </div>
            </div>
          </template>

          <template v-else #body="{ data, field }: { data: any, field: any }">
            <div
              class="px-2 py-3"
              :class="{ 'bg-gray-100 text-gray-500': (data as any).upcoming }"
            >
              {{ (data as any)[field] }}
            </div>
          </template>
        </Column>
      </template>
    </DataTable>

    <div v-else>
      {{ $t('study.dataHealth.noDataInfo') }}
    </div>

    <div class="mt-4 flex justify-end">
      <Button
        type="button"
        class="btn-gray"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />
    </div>
  </div>
</template>

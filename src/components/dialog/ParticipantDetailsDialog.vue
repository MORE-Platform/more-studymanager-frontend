<script setup lang="ts">
  import { computed, inject, onMounted, ref } from 'vue';
  import Button from 'primevue/button';
  import { Participant, StudyTimeline } from '@gs';
  import { useCalendarApi } from '../../composable/useApi';
  import { AxiosError, AxiosResponse } from 'axios';
  import { useErrorHandling } from '../../composable/useErrorHandling';
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  const { handleIndividualError } = useErrorHandling();
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';

  const { calendarApi } = useCalendarApi();
  const studyStore = useStudyStore();
  const { t, d } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const participant: Participant = dialogRef.value.data?.participant || {};
  const studyId: number = dialogRef.value.data?.studyId || {};

  const participantStudyTimeline = ref();

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
      header: t('global.labels.time')
    },
    {
      field: 'dataHealth',
      header: t('observation.props.dataHealth')
    }
  ];

  function closeDialog(): void {
    dialogRef.value.close();
  }

  const dataHealthIndicatorBg = computed(() => {
    if (participant.dataHealthIndicator) {
      switch (participant.dataHealthIndicator) {
        case 'green':
          return 'btn-accepted';
        case 'orange':
          return 'btn-warn';
        case 'red':
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
        case 'green':
          return 'pi pi-check';
        case 'orange':
          return 'pi pi-exclamation-triangle';
        case 'red':
          return 'pi pi-times';
        default:
          return 'pi pi-exclamation-triangle';
      }
    }
    return 'pi pi-exclamation-triangle';
  });

  // get timeline data for the participant
  async function getParticipantTimeline(): Promise<void> {
    try {
      const response: AxiosResponse<StudyTimeline> = await calendarApi.getStudyTimeline(
        studyId,
        undefined,
        undefined,
        undefined,
        studyStartDate,
        studyEndDate,
        undefined,
      )

      const now = new Date()

      participantStudyTimeline.value = response.data.observations
        ?.filter(item => new Date(item.start as string) >= now)
        .map(item => ({
          observationTitle: item.title,
          observationId: item.observationId,
          observationType: item.type,
          start: item.start,
          end: item.end,
          timeInfo: `${d(new Date(item.start as string), 'long')} -
            ${d(new Date(item.end as string), 'short') === d(new Date(item.start as string), 'short')
              ? d(new Date(item.end as string), 'long').toString().slice(12)
              : d(new Date(item.end as string), 'long')}`,
          dataHealth: '-',
          upcoming: true
        })) ?? []
    } catch (e) {
      handleIndividualError(e as AxiosError, 'cannot list studyTimeline')
    }
  }

  onMounted(async () => {
    await getParticipantTimeline();
  });
</script>

<template>
  <div class="text-base">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3>{{ participant.alias }}</h3>
        <div>Id: {{ participant.participantId }}</div>
      </div>
      <div
        v-if="participant.dataHealthIndicator"
        :class="dataHealthIndicatorBg"
        class="flex aspect-square !w-10 items-center justify-center"
      >
        <span :class="dataHealthIndicatorIcon" class="!text-xl" />
      </div>
    </div>

    <DataTable v-if="participantStudyTimeline" :value="participantStudyTimeline">
      <template v-for="(col, colIndex) in tableColumns" :key="colIndex">
        <Column
          :field="col.field"
          :header="col.header"
          :class="{'bg-gray-100 text-gray-500': participantStudyTimeline[colIndex].dataHealth === '-'}"
        >
        </Column>
      </template>
    </DataTable>

    <div class="flex justify-end mt-4">
      <Button
        type="button"
        class="btn-gray"
        :label="$t('global.labels.close')"
        @click="closeDialog"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useStudyGroupStore } from '../stores/studyGroupStore';
  import ConfirmDialog from 'primevue/confirmdialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import {
    useDataApi,
    useObservationsApi,
    useParticipantsApi,
  } from '../composable/useApi';
  import useLoader from '../composable/useLoader';
  import { useI18n } from 'vue-i18n';
  import { useErrorHandling } from '../composable/useErrorHandling';
  import { ref, Ref } from 'vue';
  import {
    Observation,
    Participant,
    ParticipationData,
    StudyGroup,
  } from '../generated-sources/openapi';
  import { ParticipationDataMapping } from '../models/ParticipationData';
  import { AxiosError } from 'axios';
  import { MoreTableColumn } from '../models/MoreTableModel';
  import MoreTable from '../components/shared/MoreTable.vue';
  import dayjs from 'dayjs';

  const studyGroupStore = useStudyGroupStore();

  const { dataApi } = useDataApi();
  const { participantsApi } = useParticipantsApi();
  const { observationsApi } = useObservationsApi();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
  });

  const loader = useLoader();
  const { t } = useI18n();
  const { handleIndividualError } = useErrorHandling();

  const participationDataListMap: Ref<ParticipationDataMapping[]> = ref([]);

  const studyGroups: StudyGroup[] = studyGroupStore.studyGroups;

  async function listParticipationData(): Promise<void> {
    await dataApi
      .getParticipationData(props.studyId)
      .then(async (response) => {
        const data: ParticipationDataMapping[] = await Promise.all(
          response.data.map(async (item) => {
            return await getParticipationDataMapping(item);
          })
        );
        participationDataListMap.value = data;
        return data;
      })
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participants');
      });
  }

  async function getParticipationDataMapping(data: ParticipationData) {
    return await Promise.all([
      participantsApi.getParticipant(
        props.studyId,
        data.participantId as number
      ),
      observationsApi.listObservations(props.studyId),
    ]).then(([participantRes, observationRes]) => {
      const participant: Participant = participantRes.data;
      const observation: Observation =
        observationRes.data.find((o: Observation) => {
          if (o.observationId === data.observationId) {
            return o;
          }
        }) || {};

      const participantDataMapping: ParticipationDataMapping = {
        participantAlias: participant.alias as string,
        observationTitle: `${observation.title} (${observation.type})`,
        observationId: data.observationId as number,
        studyGroupTitle: getStudyGroupLabel(data.studyGroupId as number),
        dataReceived: t(
          `global.labels.${
            data.dataReceived ? 'dataReceived' : 'noDataReceived'
          }`
        ),
        lastDataReceived: data.lastDataReceived
          ? dayjs(data.lastDataReceived).format('DD/MM/YYYY, hh:mm')
          : '-',
      };
      return participantDataMapping;
    });
  }
  function getStudyGroupLabel(studyGroupId: number): string {
    const t = studyGroups.find((group) => group.studyGroupId === studyGroupId);
    return t?.title ? (t.title as string) : 'Entire Study';
  }

  const studyDataColumns: MoreTableColumn[] = [
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
      field: 'observationTitle',
      header: t('observation.singular'),
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
    },
  ];

  /*
  function goToObservation(observationId: number) {
    console.log(observationId);
    router.push({
      name: t('studyNavigation.tabs.observation'),
      params: { studyId: props.studyId },
    });
  }
   */

  listParticipationData();
</script>

<template>
  <div>
    <MoreTable
      row-id="observationId"
      :title="$t('data.title')"
      :subtitle="$t('data.description')"
      :columns="studyDataColumns"
      :rows="participationDataListMap"
      :row-actions="[]"
      :row-edit-btn="false"
      :sort-options="{ sortField: 'participant', sortOrder: -1 }"
      :editable="() => false"
      :loading="loader.isLoading.value"
      :empty-message="$t('data.dataList.emptyListMsg')"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

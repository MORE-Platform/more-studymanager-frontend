<script setup lang="ts">
  import { useStudyGroupStore } from '../stores/studyGroupStore';
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
    StudyRole,
    StudyStatus,
  } from '../generated-sources/openapi';
  import { ParticipationDataMap } from '../models/ParticipationData';
  import { AxiosError } from 'axios';
  import {
    MoreTableAction,
    MoreTableColumn,
    MoreTableRowActionResult,
  } from '../models/MoreTableModel';
  import { useRouter } from 'vue-router';
  import MoreTable from '../components/shared/MoreTable.vue';

  const studyGroupStore = useStudyGroupStore();
  const router = useRouter();

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

  const studyDataList: Ref<ParticipationData[]> = ref([]);
  const studyDataListMapped: Ref<ParticipationDataMap[]> = ref([]);

  const studyGroups: StudyGroup[] = studyGroupStore.studyGroups;

  async function listStudyData(): Promise<void> {
    studyDataList.value = await dataApi
      .getParticipationData(props.studyId)
      .then((response) => response.data)
      .catch((e: AxiosError) => {
        handleIndividualError(e, 'cannot list participants');
        return studyDataList.value;
      });
  }

  async function getParticipationDataMapping(data: ParticipationData) {
    return await Promise.all([
      participantsApi.getParticipant(
        props.studyId,
        data.participantId as number
      ) as Participant,
      observationsApi.listObservations(props.studyId) as Observation,
    ]).then(([participantRes, observationRes]) => {
      return {
        participant: participantRes.alias,
        observation: observationRes.title + ' (' + observationRes.type + ')',
        observationId: data.observationId,
        studyGroup: getStudyGroupLabel(data.studyGroupId as number),
        dataReceived: getParticipantStatusLabel(data.dataReceived),
        lastDataReceived: data.lastDataReceived as string,
      } as ParticipationDataMap;
    });
  }
  function getStudyGroupLabel(studyGroupId: number) {
    if (studyGroups.find((group) => group.studyGroupId === studyGroupId)) {
      studyGroups.find((group) => {
        if (group.studyGroupId === studyGroupId) {
          return group.title;
        }
      });
    } else {
      return studyGroupId.toString();
    }
  }
  function getParticipantStatusLabel(status: boolean | undefined) {
    if (status) {
      return 'active';
    } else {
      return 'waiting';
    }
  }

  function mapStudyList(): void {
    studyDataListMapped.value = studyDataList.value.map( (data) =>
      getParticipationDataMapping(data)
    );
  }

  const studyDataColumns: MoreTableColumn[] = [
    {
      field: 'participant',
      header: t('participants.singular'),
      sortable: true,
    },
    { field: 'observation', header: t('observation.singular'), sortable: true },
    {
      field: 'studyGroup',
      header: t('study.props.studyGroup'),
      sortable: true,
    },
    {
      field: 'dataReceived',
      header: t('global.labels.dataReceived'),
      sortable: true,
    },
    {
      field: 'lastDataReceived',
      header: t('global.labels.lastDataReceived'),
      sortable: true,
    },
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'goToObservation',
      label: t('global.labels.delete'),
      icon: 'pi pi-arrow-right',
      visible: (data) =>
        data.status === StudyStatus.Draft &&
        data.userRoles.some((r: any) =>
          [StudyRole.Admin, StudyRole.Operator].includes(r)
        ),
    },
  ];

  function executeAction(
    action: MoreTableRowActionResult<ParticipationDataMap>
  ) {
    switch (action.id) {
      case 'goToObservation':
        return goToObservation(action.row.observationId);
    }
  }

  function goToObservation(observationId: number) {
    console.log(observationId);
    router.push({
      name: t('studyNavigation.tabs.observation'),
      params: { studyId: props.studyId },
    });
  }

  listStudyData();
  mapStudyList();
</script>

<template>
  <div>
    <MoreTable
      row-id="observationId"
      :title="$t('data.title')"
      :subtitle="$t('data.description')"
      :columns="studyDataColumns"
      :rows="studyDataListMapped"
      :row-actions="rowActions"
      :editable-access="true"
      :sort-options="{ sortField: 'participant', sortOrder: -1 }"
      :editable="() => false"
      :loading="loader.isLoading.value"
      :empty-message="$t('data.dataList.emptyListMsg')"
      @onaction="executeAction($event)"
    />
    <ConfirmDialog></ConfirmDialog>
    <DynamicDialog />
  </div>
</template>

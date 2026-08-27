/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0).
 */
<script setup lang="ts">
  import { computed, inject, ref, watch } from 'vue';
  import {
    Participant,
    ParticipantApplicationAccess as ParticipantApplicationAccessModel,
    ParticipantStatus
  } from '@gs';
  import { useI18n } from 'vue-i18n';
  import Button from 'primevue/button';
  import Tag from 'primevue/tag';
  import InputText from 'primevue/inputtext';
  import MultiSelect from 'primevue/multiselect';
  import Select from 'primevue/select';
  import ProgressSpinner from 'primevue/progressspinner';
  import { useToast } from 'primevue/usetoast';
  import { useParticipant, useUpdateParticipant } from '@/api/participantQueries';
  import { useParticipantApplications } from '@/api/participantApplicationAccessQueries';
  import ParticipantApplicationAccess from '../ParticipantApplicationAccess.vue';
  import { useStudyStore } from '@/stores/studyStore';
  import { useStudyGroupStore } from '@/stores/studyGroupStore';
  import { useObservationGroupStore } from '@/stores/observationGroupStore';

  const { t, d } = useI18n();
  const studyStore = useStudyStore();
  const studyGroupStore = useStudyGroupStore();
  const observationGroupStore = useObservationGroupStore();
  const toast = useToast();
  const dialogRef: any = inject('dialogRef');

  const {
    data: fetchedParticipant,
    isLoading: loadingParticipantData,
    refetch: refetchParticipant,
  } = useParticipant(
    studyStore.studyId,
    dialogRef.value.data?.participant?.participantId,
  );

  const participant = ref<Participant | undefined>();

  watch(
    fetchedParticipant,
    (newData) => {
      participant.value = newData
        ? {
            ...newData,
            observationGroupIds: [...(newData.observationGroupIds || [])],
          }
        : undefined;
    },
    { immediate: true },
  );

  const { mutate: updateParticipantMutation } = useUpdateParticipant();

  const { data: participantApps, refetch: refetchApps } =
    useParticipantApplications(
      studyStore.studyId,
      dialogRef.value.data?.participant?.participantId,
    );

  const handleDeletedApps = (): void => {
    refetchApps();
    refetchParticipant();
  };

  const handleCreatedApps = (): void => {
    refetchParticipant();
  };

  const userState = computed(() => participant?.value?.status || 'new');

  const close = (): void => {
    dialogRef.value.close();
  };

  const updateParticipant = (): void => {
    const participantData = participant?.value;
    if (
      !participantData ||
      !participantData.participantId ||
      !studyStore.studyIsEditable
    )
      return;

    if (!participantData.alias || participantData.alias.trim() === '') {
      toast.add({
        severity: 'error',
        summary: t('global.error.type.error'),
        detail: t('participants.dialog.error.aliasRequired'),
        life: 3000,
      });
      return;
    }

    const updateData = { ...participantData };
    delete updateData.observationGroupIds;

    updateParticipantMutation(
      {
        studyId: studyStore.studyId,
        participantId: participantData.participantId,
        participant: {
          ...updateData,
          studyGroupId: participantData.studyGroupId
            ? Number(participantData.studyGroupId)
            : undefined,
          observationGroupIds:
            participantData.observationGroupIds?.map((id: any) => Number(id)) ||
            [],
        },
      },
      {
        onSuccess: () => {
          toast.add({
            summary: t('participants.dialog.updated'),
            severity: 'success',
            life: 2000,
          });
        },
        onError: () => {
          toast.add({ summary: t('participants.dialog.updateFailed') });
        },
      },
    );
  };

  const getStatusSeverity = (status?: string): string => {
    switch (status) {
      case ParticipantStatus.Active:
        return 'success';
      case ParticipantStatus.Invited:
        return 'info';
      case ParticipantStatus.New:
        return 'warn';
      case ParticipantStatus.Abandoned:
      case ParticipantStatus.KickedOut:
      case ParticipantStatus.Locked:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStudyGroupLabel = (id?: number): string => {
    return (
      studyGroupStore.studyGroups.find((g) => g.studyGroupId === id)?.title ||
      t('global.placeholder.noGroup')
    );
  };

  const getObservationGroupLabel = (id?: number): string => {
    return (
      observationGroupStore.observationGroups.find(
        (g) => g.observationGroupId === id,
      )?.title ||
      id?.toString() ||
      t('global.placeholder.noGroup')
    );
  };

  const formatAllAccessData = (): string => {
    if (!participantApps.value) return '';

    let text =
      t('participants.applicationAccess.allAccessData.header', {
        alias: fetchedParticipant?.value?.alias,
      }) + '\n\n';

    (participantApps.value as ParticipantApplicationAccessModel[]).forEach(
      (data) => {
        text += `${t(`study.applications.label.${data.applicationType}`)}:\n`;
        text += `${t('participants.applicationAccess.label.url')}: ${data.applicationUrl}\n`;
        text += `${t('participants.applicationAccess.label.accessCode')}: ${data.accessCode}\n\n`;
      },
    );

    return text;
  };

  const copyAllAccessData = (): void => {
    const text = formatAllAccessData();
    if (text && navigator?.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('global.labels.success'),
            detail: t('participants.dialog.header.alert'),
            life: 2000,
          });
        })
        .catch(console.error);
    }
  };

  const emailAllAccessData = (): void => {
    const text = formatAllAccessData();
    const subject = encodeURIComponent(
      t('participants.applicationAccess.allAccessData.subject', {
        alias: fetchedParticipant?.value?.alias,
      }),
    );
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
</script>

<template>
  <div v-if="participant">
    <div class="no-print mb-6 flex items-start justify-between">
      <div class="flex w-full flex-col gap-1">
        <div class="flex w-full items-center justify-between">
          <div class="text-sm font-medium text-gray-500">
            {{ $t('participants.props.participantId') }}:
            {{ participant.participantId }}
          </div>
          <Tag
            :value="$t('userstatus.' + userState)"
            :severity="getStatusSeverity(userState)"
            class="shrink-0 text-xs uppercase"
          />
        </div>
        <div class="flex w-full flex-col items-start gap-3">
          <h5 class="font-semibold">
            {{ $t('participants.props.participantAlias') }}:
          </h5>
          <InputText
            v-if="studyStore.studyIsEditable"
            v-model="participant.alias"
            class="w-full bg-transparent text-lg font-semibold"
          />
          <h2 v-else class="text-lg font-semibold">
            {{ participant.alias }}
          </h2>
        </div>
        <div class="text-sm font-medium text-gray-500">
          {{ $t('participants.props.individualStart') }}:
          {{
            participant.start
              ? d(new Date(participant.start), 'long')
              : $t('participants.props.notStartedYet')
          }}
        </div>
      </div>
    </div>

    <div class="no-print mb-6 flex w-full! flex-row items-end gap-4">
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <label class="text-xs font-bold text-gray-400 uppercase">{{
          $t('study.props.studyGroup')
        }}</label>
        <Select
          v-if="studyStore.studyIsEditable"
          v-model="participant.studyGroupId"
          :options="studyGroupStore.studyGroups"
          option-label="title"
          option-value="studyGroupId"
          class="participant-row-select w-full min-w-0"
          show-clear
        />
        <div v-else class="truncate text-sm font-medium">
          {{ getStudyGroupLabel(participant.studyGroupId) }}
        </div>
      </div>
      <div class="flex min-w-0 flex-1 items-center justify-between">
        <div class="flex w-full min-w-0 flex-col gap-1">
          <label class="text-xs font-bold text-gray-400 uppercase">{{
            $t('observationGroup.plural')
          }}</label>
          <MultiSelect
            v-if="studyStore.studyIsEditable"
            v-model="participant.observationGroupIds"
            :options="observationGroupStore.observationGroups"
            option-label="title"
            option-value="observationGroupId"
            class="participant-row-multiselect w-full min-w-0"
            :show-toggle-all="false"
          />
          <div v-else class="flex flex-wrap gap-1">
            <Tag
              v-for="obsGroupId in participant.observationGroupIds"
              :key="obsGroupId"
              :value="getObservationGroupLabel(obsGroupId)"
              severity="secondary"
              class="text-[10px]"
            />
            <span
              v-if="!participant.observationGroupIds?.length"
              class="text-sm font-medium"
              >-</span
            >
          </div>
        </div>
      </div>
      <Button
        v-if="studyStore.studyIsEditable"
        :label="$t('global.labels.save')"
        class="btn-primary shrink-0"
        @click="updateParticipant"
      />
    </div>

    <div class="no-print mt-8 mb-8 border-t pt-8">
      <div class="mx-2 mb-4 flex items-center justify-between">
        <h3 class="m-0 text-lg font-bold">
          {{ $t('participants.applicationAccess.title') }}
        </h3>
        <div class="flex items-center gap-2">
          <Button
            v-tooltip.top="$t('participants.applicationAccess.btn.copyAll')"
            icon="pi pi-copy"
            class="p-button-sm"
            :disabled="!participantApps?.length"
            @click="copyAllAccessData"
          />
          <Button
            v-tooltip.top="$t('participants.applicationAccess.btn.emailAll')"
            icon="pi pi-envelope"
            class="p-button-sm"
            :disabled="!participantApps?.length"
            @click="emailAllAccessData"
          />
        </div>
      </div>

      <div
        v-if="
          participant.participantId &&
          (studyStore.study.applicationAccess?.length ?? 0) > 0
        "
      >
        <template
          v-for="app in studyStore.study.applicationAccess"
          :key="`study-${app}`"
        >
          <ParticipantApplicationAccess
            :study-id="studyStore.studyId"
            :participant-id="participant.participantId"
            :application-name="app"
            :initial-access-data="
              participantApps?.find((pApp) => pApp.applicationType === app)
            "
            @created="handleCreatedApps"
            @deleted="handleDeletedApps"
          />
        </template>
      </div>
      <div
        v-else
        class="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500"
      >
        {{ $t('participants.applicationAccess.noAccess') }}
      </div>
    </div>

    <div class="no-print mt-8 flex justify-end gap-3">
      <Button
        :label="$t('global.labels.close')"
        class="btn-gray"
        @click="close"
      />
    </div>
  </div>
  <div v-else-if="loadingParticipantData" class="flex flex-col items-center">
    <ProgressSpinner />
    <label>{{ $t('participants.loadingData') }}</label>
  </div>
</template>

<style scoped>
  .participant-row-select,
  .participant-row-multiselect {
    min-width: 0;
  }

  :deep(.participant-row-select .p-select),
  :deep(.participant-row-multiselect .p-multiselect) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  :deep(.participant-row-select .p-select-label),
  :deep(.participant-row-multiselect .p-multiselect-label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

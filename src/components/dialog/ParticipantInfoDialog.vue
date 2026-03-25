<script setup lang="ts">
  import { computed, inject, ref } from 'vue';
  import {
    ParticipantApplicationAccess as ParticipantApplicationAccessModel,
    ParticipantStatus,
  } from '@gs';
  import { useI18n } from 'vue-i18n';
  import Button from 'primevue/button';
  import Tag from 'primevue/tag';
  import InputText from 'primevue/inputtext';
  import MultiSelect from 'primevue/multiselect';
  import Select from 'primevue/select';
  import { useParticipantsApi } from '@/composable/useApi';
  import { useToast } from 'primevue/usetoast';
  import { MoreTableChoice } from '@/models/MoreTableModel';
  import { useParticipantApplications } from '@/api/participantApplicationAccessQueries';
  import { useStudyStore } from '@/stores/studyStore';
  import ParticipantApplicationAccess from '../ParticipantApplicationAccess.vue';

  const { t, d } = useI18n();
  const toast = useToast();
  const dialogRef: any = inject('dialogRef');
  const { participantsApi } = useParticipantsApi();

  const participant = ref<any>({
    ...dialogRef.value.data?.participant,
    studyGroupId: dialogRef.value.data?.participant.studyGroupId?.toString(),
    observationGroupIds:
      dialogRef.value.data?.participant.observationGroupIds?.map((id: any) =>
        id.toString(),
      ) || [],
  });

  const studyGroups: MoreTableChoice[] =
    dialogRef.value.data?.studyGroups || [];
  const observationGroups: MoreTableChoice[] =
    dialogRef.value.data?.observationGroups || [];
  const isEditable: boolean = dialogRef.value.data?.isEditable || false;
  const studyId: number = dialogRef.value.data?.studyId;

  const studyStore = useStudyStore();
  const participantId = participant.value.participantId!;

  const { data: participantApps, refetch: refetchApps } =
    useParticipantApplications(studyId, participantId);

  const pendingApps = ref<{ id: number; value: string }[]>([]);
  let nextPendingId = 0;

  const availableStudyApps = computed(() => {
    const studyApps = studyStore.study.applicationAccess || [];
    const existingApps =
      (participantApps.value as ParticipantApplicationAccessModel[]) || [];
    const selectedPendingApps = pendingApps.value
      .map((p) => p.value)
      .filter((v) => v !== '');
    return studyApps.filter(
      (app: string) =>
        !existingApps.some((ea) => ea.applicationType === app) &&
        !selectedPendingApps.includes(app),
    );
  });

  const allParticipantAppsCount = computed(() => {
    return (participantApps.value?.length || 0) + pendingApps.value.length;
  });

  const addApplication = (): void => {
    pendingApps.value.push({ id: nextPendingId++, value: '' });
  };

  const handleCreated = (pendingId: number): void => {
    const index = pendingApps.value.findIndex((app) => app.id === pendingId);
    if (index > -1) {
      pendingApps.value.splice(index, 1);
    }
    refetchApps();
  };

  const handleDeleted = (): void => {
    refetchApps();
  };

  const removePending = (pendingId: number): void => {
    const index = pendingApps.value.findIndex((app) => app.id === pendingId);
    if (index > -1) {
      pendingApps.value.splice(index, 1);
    }
  };

  const userState = computed(() => participant.value.status || 'new');

  const close = (): void => {
    dialogRef.value.close();
  };

  const updateParticipant = (): void => {
    if (!isEditable) return;

    if (!participant.value.alias || participant.value.alias.trim() === '') {
      toast.add({
        severity: 'error',
        summary: t('global.error.type.error'),
        detail: t('participants.dialog.error.aliasRequired'),
        life: 3000,
      });
      return;
    }

    const updateData = { ...participant.value };
    delete updateData.observationGroupValues;

    participantsApi
      .updateParticipant(studyId, participant.value.participantId!, {
        ...updateData,
        studyGroupId:
          participant.value.studyGroupId &&
          participant.value.studyGroupId !== 'null'
            ? Number(participant.value.studyGroupId)
            : undefined,
        observationGroupIds:
          participant.value.observationGroupIds?.map((id: any) => Number(id)) ||
          [],
      })
      .then(() => {
        toast.add({
          summary: t('participants.dialog.updated'),
          severity: 'success',
          life: 2000,
        });
      })
      .catch((): void => {
        toast.add({ summary: t('participants.dialog.updateFailed') });
      });
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

  const getStudyGroupLabel = (id?: string): string => {
    return (
      studyGroups.find((g) => g.value === id)?.label ||
      t('global.placeholder.noGroup')
    );
  };

  const getObservationGroupLabel = (id: string): string => {
    return (
      observationGroups.find((g) => g.value === id)?.label || id.toString()
    );
  };

  const formatAllAccessData = (): string => {
    if (!participantApps.value) return '';

    let text =
      t('participants.applicationAccess.allAccessData.header', {
        alias: participant.value.alias,
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
        alias: participant.value.alias,
      }),
    );
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
</script>

<template>
  <div class="min-w-100">
    <div class="no-print mb-6 flex items-start justify-between">
      <div class="flex w-full flex-col gap-1">
        <div class="flex w-full flex-col items-start gap-3">
          <h5 class="font-semibold">
            {{ $t('participants.props.participantAlias') }}:
          </h5>
          <InputText
            v-if="isEditable"
            v-model="participant.alias"
            class="w-full bg-transparent text-lg font-semibold"
          />
          <h2 v-else class="text-lg font-semibold">
            {{ participant.alias }}
          </h2>
          <Tag
            :value="$t('userstatus.' + userState)"
            :severity="getStatusSeverity(userState)"
            class="shrink-0 text-xs uppercase"
          />
        </div>
        <div class="text-sm font-medium text-gray-500">
          {{ $t('participants.props.participantId') }}:
          {{ participant.participantId }}
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

    <div class="no-print mb-6 grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-400 uppercase">{{
          $t('study.props.studyGroup')
        }}</label>
        <Select
          v-if="isEditable"
          v-model="participant.studyGroupId"
          :options="studyGroups"
          option-label="label"
          option-value="value"
          class="w-full"
        />
        <div v-else class="text-sm font-medium">
          {{ getStudyGroupLabel(participant.studyGroupId) }}
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-400 uppercase">{{
          $t('observationGroup.plural')
        }}</label>
        <MultiSelect
          v-if="isEditable"
          v-model="participant.observationGroupIds"
          :options="observationGroups"
          option-label="label"
          option-value="value"
          class="w-full"
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
    <div class="no-print mt-8 flex justify-end gap-3">
      <Button
        v-if="isEditable"
        :label="$t('global.labels.save')"
        class="btn-primary"
        @click="updateParticipant"
      />
    </div>

    <div class="no-print mt-8 mb-8 border-t pt-8">
      <div class="mb-4 flex items-center justify-between">
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
          <span
            v-tooltip.top="
              availableStudyApps.length === 0
                ? $t('participants.applicationAccess.addTooltip')
                : undefined
            "
            class="ml-4"
          >
            <Button
              :label="$t('participants.applicationAccess.add')"
              icon="pi pi-plus"
              class="p-button-sm"
              :disabled="availableStudyApps.length === 0"
              @click="addApplication"
            />
          </span>
        </div>
      </div>

      <div v-if="allParticipantAppsCount > 0">
        <template
          v-for="app in participantApps as ParticipantApplicationAccessModel[]"
          :key="`existing-${app.applicationType}`"
        >
          <ParticipantApplicationAccess
            :study-id="studyId"
            :participant-id="participantId"
            :application-name="app.applicationType"
            :initial-access-data="app"
            :available-applications="studyStore.study.applicationAccess || []"
            @deleted="handleDeleted"
          />
        </template>
        <template v-for="app in pendingApps" :key="`pending-${app.id}`">
          <ParticipantApplicationAccess
            v-model:application-name="app.value"
            :study-id="studyId"
            :participant-id="participantId"
            :available-applications="[
              ...availableStudyApps,
              ...(app.value ? [app.value] : []),
            ]"
            @created="() => handleCreated(app.id)"
            @deleted="() => removePending(app.id)"
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
</template>

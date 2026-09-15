/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { PropType, ref, watch } from 'vue';
  import { Milestone, ParticipantMilestone } from '@gs';
  import { useI18n } from 'vue-i18n';
  import { useToast } from 'primevue/usetoast';
  import Calendar from 'primevue/calendar';
  import Button from 'primevue/button';
  import { useGlobalStore } from '@/stores/globalStore';
  import {
    useCreateParticipantMilestone,
    useDeleteParticipantMilestone,
    useUpdateParticipantMilestone,
  } from '@/api/participantMilestoneQueries';

  const dateFormat = useGlobalStore().getDateFormat;
  const { t } = useI18n();
  const toast = useToast();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    participantId: {
      type: Number,
      required: true,
    },
    milestone: {
      type: Object as PropType<Milestone>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    existing: {
      type: Object as PropType<ParticipantMilestone | undefined>,
      default: undefined,
    },
  });

  const dateValue = ref<Date | undefined>(
    props.existing?.dateTime ? new Date(props.existing.dateTime) : undefined,
  );
  const timeValue = ref<Date | undefined>(
    props.existing?.dateTime ? new Date(props.existing.dateTime) : undefined,
  );

  watch(
    () => props.existing,
    (newExisting) => {
      if (newExisting?.dateTime) {
        dateValue.value = new Date(newExisting.dateTime);
        timeValue.value = new Date(newExisting.dateTime);
      } else if (!newExisting) {
        dateValue.value = undefined;
        timeValue.value = undefined;
      }
    },
  );

  function combinedDateTime(): Date | undefined {
    if (!dateValue.value) return undefined;
    const result = new Date(dateValue.value);
    if (timeValue.value) {
      result.setHours(
        timeValue.value.getHours(),
        timeValue.value.getMinutes(),
        0,
        0,
      );
    } else {
      result.setHours(0, 0, 0, 0);
    }
    return result;
  }

  const createMutation = useCreateParticipantMilestone();
  const updateMutation = useUpdateParticipantMilestone();
  const deleteMutation = useDeleteParticipantMilestone();
  const saving = ref(false);
  const deleting = ref(false);

  async function save(): Promise<void> {
    const dateTime = combinedDateTime();
    if (!dateTime || !props.milestone.milestoneId) return;
    saving.value = true;
    try {
      if (props.existing?.participantMilestoneId) {
        await updateMutation.mutateAsync({
          studyId: props.studyId,
          participantId: props.participantId,
          milestoneId: props.milestone.milestoneId,
          participantMilestone: {
            ...props.existing,
            dateTime: dateTime.toISOString(),
          },
        });
      } else {
        await createMutation.mutateAsync({
          studyId: props.studyId,
          participantId: props.participantId,
          milestoneId: props.milestone.milestoneId,
          dateTime: dateTime.toISOString(),
        });
      }
      toast.add({
        summary: t('participants.milestones.saved'),
        severity: 'success',
        life: 2000,
      });
    } catch {
      toast.add({
        summary: t('participants.milestones.saveFailed'),
        severity: 'error',
        life: 3000,
      });
    } finally {
      saving.value = false;
    }
  }

  async function deleteMilestoneDate(): Promise<void> {
    if (!props.existing?.participantMilestoneId || !props.milestone.milestoneId)
      return;
    deleting.value = true;
    try {
      await deleteMutation.mutateAsync({
        studyId: props.studyId,
        participantId: props.participantId,
        milestoneId: props.milestone.milestoneId,
      });
      toast.add({
        summary: t('participants.milestones.deleted'),
        severity: 'success',
        life: 2000,
      });
    } catch {
      toast.add({
        summary: t('participants.milestones.deleteFailed'),
        severity: 'error',
        life: 3000,
      });
    } finally {
      deleting.value = false;
    }
  }
</script>

<template>
  <div class="flex items-end gap-3">
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <label class="text-xs font-bold text-gray-400 uppercase">{{
        milestone.name
      }}</label>
      <div class="flex items-center gap-2">
        <span class="w-6 shrink-0 text-right text-sm text-gray-400">{{
          index + 1
        }}</span>
        <Calendar
          v-model="dateValue"
          :date-format="dateFormat"
          :placeholder="t('participants.milestones.placeholder.dateTime')"
          :manual-input="false"
          autocomplete="off"
          class="w-full"
        />
        <Calendar
          v-model="timeValue"
          time-only
          hour-format="24"
          :placeholder="t('participants.milestones.placeholder.time')"
          :manual-input="false"
          class="w-32 shrink-0"
        />
      </div>
    </div>
    <Button
      :label="t('global.labels.save')"
      class="btn-primary shrink-0"
      :loading="saving"
      :disabled="!dateValue"
      @click="save"
    />
    <Button
      icon="pi pi-trash"
      class="btn-important shrink-0"
      :loading="deleting"
      :disabled="!existing"
      @click="deleteMilestoneDate"
    />
  </div>
</template>

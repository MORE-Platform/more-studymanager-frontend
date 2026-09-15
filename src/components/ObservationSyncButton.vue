/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { computed } from 'vue';
  import { AxiosError } from 'axios';
  import Button from 'primevue/button';
  import { useToast } from 'primevue/usetoast';
  import { useI18n } from 'vue-i18n';
  import {
    useCreateObservationResync,
    useObservationResyncStatus,
  } from '../api/participantQueries';

  const props = defineProps<{
    studyId: number;
    participantId: number;
    observationId: number;
  }>();

  const { t } = useI18n();
  const toast = useToast();

  const { data: resyncStatus } = useObservationResyncStatus(
    () => props.studyId,
    () => props.participantId,
    () => props.observationId,
  );
  const createResync = useCreateObservationResync();

  const resyncable = computed(() => resyncStatus.value?.resyncable ?? false);
  const pending = computed(
    () => resyncStatus.value?.pending || createResync.isPending.value,
  );

  async function triggerResync(): Promise<void> {
    try {
      await createResync.mutateAsync({
        studyId: props.studyId,
        participantId: props.participantId,
        observationId: props.observationId,
      });
      toast.add({
        summary: t('participants.dialog.resync.requested'),
        severity: 'success',
        life: 2000,
      });
    } catch (error) {
      if ((error as AxiosError).response?.status !== 409) {
        toast.add({
          summary: t('participants.dialog.resync.failed'),
          severity: 'error',
          life: 3000,
        });
      }
    }
  }
</script>

<template>
  <Button
    v-if="resyncable"
    v-tooltip.bottom="$t('participants.dialog.resync.tooltip')"
    type="button"
    icon="pi pi-sync"
    :loading="pending"
    :disabled="pending"
    @click="triggerResync"
  />
</template>

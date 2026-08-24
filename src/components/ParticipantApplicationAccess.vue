/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Button from 'primevue/button';
  import QrcodeVue from 'qrcode.vue';
  import { useToast } from 'primevue/usetoast';
  import { useDialog } from 'primevue/usedialog';
  import {
    useCreateParticipantAccessData,
    useDeleteParticipantApplicationAccessData,
    useParticipantAccessData,
  } from '@/api/participantApplicationAccessQueries';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';
  import type { ParticipantApplicationAccess } from '@gs';

  const props = defineProps<{
    studyId: number;
    participantId: number;
    applicationName: string;
    initialAccessData?: ParticipantApplicationAccess;
  }>();

  const emit = defineEmits(['created', 'deleted']);

  const { t } = useI18n();
  const toast = useToast();
  const dialog = useDialog();

  const forceFetch = ref(false);

  const {
    data: fetchedAccessData,
    isLoading: loadingAccessData,
    isError,
  } = useParticipantAccessData(
    props.studyId,
    props.participantId,
    computed(() => props.applicationName),
    computed(() => forceFetch.value && !props.initialAccessData),
  );

  const accessData = computed(
    () => props.initialAccessData || fetchedAccessData.value,
  );

  const createMutation = useCreateParticipantAccessData();
  const deleteMutation = useDeleteParticipantApplicationAccessData();

  const isGenerating = ref(false);

  async function generateAccess(): Promise<void> {
    if (!props.applicationName) return;
    isGenerating.value = true;
    try {
      await createMutation.mutateAsync({
        studyId: props.studyId,
        participantId: props.participantId,
        application: props.applicationName,
      });
      emit('created', props.applicationName);
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.status === 403) {
        toast.add({
          severity: 'error',
          summary: t('global.error.type.error'),
          detail: t('participants.applicationAccess.error.alreadyExists'),
          life: 5000,
        });
        forceFetch.value = true;
        emit('created', props.applicationName);
      } else {
        toast.add({
          severity: 'error',
          summary: t('global.error.type.error'),
          detail: t('participants.applicationAccess.error.createFailed'),
          life: 3000,
        });
      }
    } finally {
      isGenerating.value = false;
    }
  }

  function confirmDelete(): void {
    dialog.open(DeleteMoreTableRowDialog, {
      data: {
        introMsg: t('participants.applicationAccess.dialog.msg.deleteIntro'),
        warningMsg: t(
          'participants.applicationAccess.dialog.msg.deleteWarning',
        ),
        confirmMsg: t(
          'participants.applicationAccess.dialog.msg.deleteConfirm',
        ),
        elTitle: t(`study.applications.label.${props.applicationName}`),
        row: props.applicationName,
      },
      props: {
        header: t('participants.applicationAccess.dialog.header.delete'),
        style: { width: '50vw' },
        breakpoints: { '960px': '75vw', '640px': '90vw' },
        modal: true,
        draggable: false,
      },
      onClose: (options) => {
        if (options?.data) {
          deleteAccess();
        }
      },
    });
  }

  async function deleteAccess(): Promise<void> {
    if (!props.applicationName) return;
    try {
      await deleteMutation.mutateAsync({
        studyId: props.studyId,
        participantId: props.participantId,
        application: props.applicationName,
        includeData: true,
      });
      emit('deleted', props.applicationName);
    } catch {
      toast.add({
        severity: 'error',
        summary: t('global.error.type.error'),
        detail: t('participants.applicationAccess.error.deleteFailed'),
        life: 3000,
      });
    }
  }

  function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      toast.add({
        severity: 'success',
        summary: t('global.labels.success'),
        detail: t('participants.dialog.header.alert'),
        life: 2000,
      });
    });
  }

  watch(isError, (newVal) => {
    if (newVal) {
      toast.add({
        severity: 'error',
        summary: t('global.error.type.error'),
        detail: t('participants.applicationAccess.error.fetchFailed'),
        life: 3000,
      });
    }
  });
</script>

<template>
  <div
    class="participant-application-access mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
  >
    <div v-if="!accessData" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h3 class="m-0 min-w-0 flex-1 truncate text-lg font-semibold">
          {{ $t(`study.applications.label.${applicationName}`) }}
        </h3>
      </div>
      <Button
        :label="$t('participants.applicationAccess.btn.generate')"
        icon="pi pi-cog"
        class="w-full"
        :loading="isGenerating || loadingAccessData"
        @click="generateAccess"
      />
    </div>
    <div v-else class="flex w-full min-w-0 flex-row items-start gap-4">
      <div class="max-w-fit! shrink-0">
        <QrcodeVue
          :value="accessData.applicationUrl"
          :size="80"
          level="M"
          render-as="canvas"
          class="rounded border border-gray-100 bg-white p-1"
        />
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-4">
        <div class="flex min-w-0 items-center justify-between gap-2">
          <h3 class="m-0 min-w-0 flex-1 truncate text-lg font-semibold">
            {{ $t(`study.applications.label.${accessData.applicationType}`) }}
          </h3>
          <Button
            icon="pi pi-trash"
            class="p-button-danger p-button-sm mx-2"
            @click="confirmDelete"
          />
        </div>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">
              {{ $t('participants.applicationAccess.label.url') }}
            </label>
            <div
              class="flex w-full min-w-0 items-center gap-2 rounded bg-gray-50 p-2"
            >
              <span class="min-w-0 flex-1 truncate text-sm text-gray-700">
                {{ accessData.applicationUrl }}
              </span>
              <Button
                icon="pi pi-copy"
                class="p-button-sm p-button shrink-0"
                @click="copyToClipboard(accessData.applicationUrl)"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-bold text-gray-400 uppercase">
              {{ $t('participants.applicationAccess.label.accessCode') }}
            </label>
            <div
              class="flex w-full min-w-0 items-center gap-2 rounded bg-gray-50 p-2"
            >
              <span
                class="min-w-0 flex-1 truncate font-mono text-sm font-semibold text-gray-800"
              >
                {{ accessData.accessCode }}
              </span>
              <Button
                icon="pi pi-copy"
                class="p-button-sm p-button shrink-0"
                @click="copyToClipboard(accessData.accessCode)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

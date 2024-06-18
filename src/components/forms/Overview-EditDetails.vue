/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { PropType } from 'vue';
  import {
    Study,
    StudyRole,
    StudyStatus,
  } from '../../generated-sources/openapi/';
  import StudyDialog from '../../components/dialog/StudyDialog.vue';
  import { useDialog } from 'primevue/usedialog';
  import Button from 'primevue/button';
  import DynamicDialog from 'primevue/dynamicdialog';
  import StudyStatusChange from './StudyStatusChange.vue';
  import { useI18n } from 'vue-i18n';
  import ChangeStudyStatusDialog from '../dialog/ChangeStudyStatusDialog.vue';

  const dialog = useDialog();
  const { t } = useI18n();

  const props = defineProps({
    study: { type: Object as PropType<Study>, required: true },
    styleModifier: { type: String, default: '' },
    userRoles: { type: Array as PropType<Array<StudyRole>>, required: true },
  });

  const emit = defineEmits<{
    (e: 'onUpdateStudy', study: Study): void;
    (e: 'onUpdateStudyStatus', status: StudyStatus): void;
  }>();

  function updateStudy(study: Study) {
    emit('onUpdateStudy', study);
  }

  function updateStudyStatus(status: StudyStatus) {
    dialog.open(ChangeStudyStatusDialog, {
      data: {
        study: props.study,
        changedStatus: status,
      },
      props: {
        header: t('study.statusChange.dialog.header'),
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
      },
      onClose: (options) => {
        if (options?.data) {
          emit('onUpdateStudyStatus', status);
        }
      },
    });
  }

  function openEditDialog() {
    dialog.open(StudyDialog, {
      data: {
        study: props.study,
      },
      props: {
        header: t('study.dialog.header.edit'),
        style: {
          width: '50vw',
        },
        breakpoints: {
          '960px': '75vw',
          '640px': '90vw',
        },
        modal: true,
        draggable: false,
      },
      onClose: (options) => {
        if (options?.data) {
          updateStudy(options.data as Study);
        }
      },
    });
  }

  const accessEditDetailsRoles: StudyRole[] = [
    StudyRole.Admin,
    StudyRole.Operator,
  ];

  function hasAccessToEdit(): boolean {
    return (
      (props.userRoles.some((r: StudyRole) =>
        accessEditDetailsRoles.includes(r),
      ) &&
        props.study.status === StudyStatus.Paused) ||
      (props.userRoles.some((r: StudyRole) =>
        accessEditDetailsRoles.includes(r),
      ) &&
        props.study.status === StudyStatus.Draft) ||
      (props.userRoles.some((r: StudyRole) =>
        accessEditDetailsRoles.includes(r),
      ) &&
        props.study.status === StudyStatus.PausedPreview)
    );
  }

  function hasMissingContactData(): boolean {
    return (
      (!props.study?.contact?.institute &&
        props.study?.contact?.person === 'pending' &&
        props.study?.contact?.email === 'pending' &&
        !props.study?.contact?.phoneNumber) ||
      (!props.study?.contact?.institute &&
        !props.study?.contact?.person &&
        !props.study?.contact?.email &&
        !props.study?.contact?.phoneNumber)
    );
  }

  const webcalUrl = `webcal://${location.host}/api/v1/studies/${props.study.studyId}/calendar.ics`;
  const calenderUrl = `${location.origin}/api/v1/studies/${props.study.studyId}/calendar.ics`;
</script>

<template>
  <div class="overview-edit-details" :class="styleModifier">
    <div class="mb-8 flex justify-between">
      <div class="grid grid-cols-3 gap-x-6 pr-3 2xl:grid-cols-5">
        <div class="order-1 grid content-center 2xl:order-1">
          <span class="font-bold">{{ $t('study.props.plannedStart') }}:</span>
          <template v-if="study.plannedStart">
            {{ $d(new Date(study.plannedStart), 'short') }}
          </template>
        </div>
        <div class="order-4 grid content-center 2xl:order-2">
          <span class="font-bold">{{ $t('study.props.actualStart') }}:</span>
          <template v-if="study.start">
            {{ $d(new Date(study.start), 'short') }}
          </template>
          <span v-else>-</span>
        </div>
        <div class="order-2 grid content-center 2xl:order-3">
          <span class="font-bold">{{ $t('study.props.plannedEnd') }}:</span>
          <template v-if="study.plannedEnd">
            {{ $d(new Date(study.plannedEnd), 'short') }}
          </template>
        </div>
        <div class="order-5 grid content-center 2xl:order-4">
          <span class="font-bold">{{ $t('study.props.actualEnd') }}:</span>
          <template v-if="study.end">{{
            $d(new Date(study.end), 'short')
          }}</template
          ><span v-else>-</span>
        </div>
        <div class="order-3 grid content-center 2xl:order-5">
          <span class="font-bold">{{ $t('study.props.duration') }}:</span>
          <span v-if="study.duration?.value && study.duration.unit">{{
            `${t(`scheduler.preview.value.${study.duration.unit}`, study.duration.value)}`
          }}</span
          ><span v-else>-</span>
        </div>
      </div>
      <div class="flex justify-items-end">
        <StudyStatusChange
          v-if="props.userRoles.find((r) => r === StudyRole.Admin)"
          :status="study.status || ''"
          @onchange="updateStudyStatus"
        ></StudyStatusChange>
        <Button
          v-if="props.study.status !== StudyStatus.Closed"
          type="button"
          :title="$t('study.statusChange.edit')"
          :disabled="!hasAccessToEdit()"
          @click="openEditDialog()"
          ><span>{{ $t('study.statusChange.edit') }}</span></Button
        >
      </div>
    </div>

    <div class="mb-6">
      <h5 class="mb-0.5 text-lg font-bold">{{ $t('study.ical.title') }}</h5>
      <div class="flex items-center">
        <div class="mr-4 inline">
          <a :href="webcalUrl">{{ calenderUrl }}</a>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <h5 class="mb-0.5 text-lg font-bold">{{ $t('study.props.purpose') }}</h5>
      <div>
        <span v-if="study.purpose">{{ study.purpose }}</span>
        <span v-else class="placeholder">
          {{ $t('study.placeholder.emptyPurpose') }}
        </span>
      </div>
    </div>
    <div class="mb-6">
      <h5 class="mb-0.5 text-lg font-bold">
        {{ $t('study.props.participantInfo') }}
      </h5>
      <div>
        <span v-if="study.participantInfo">{{ study.participantInfo }}</span>
        <span v-else class="placeholder">
          {{ $t('study.placeholder.emptyParticipantInfo') }}</span
        >
      </div>
    </div>
    <div class="mb-6">
      <h5 class="mb-0.5 text-lg font-bold">
        {{ $t('study.props.consentInfo') }}
      </h5>
      <div class="mt-2">
        <span v-if="study.consentInfo">
          {{ study.consentInfo }}
        </span>
        <span v-else>{{ $t('study.placeholder.emptyConsentInfo') }}</span>
      </div>
    </div>
    <div class="mb-6">
      <h5 class="mb-0.5 text-lg font-bold">
        {{ $t('study.props.finishText') }}
      </h5>
      <div>
        <span v-if="study.finishText">{{ study.finishText }}</span>
        <span v-else class="placeholder">{{
          $t('study.placeholder.finishTextDesc')
        }}</span>
      </div>
    </div>
    <div class="mb-6">
      <h5 class="mb-0.5 text-lg font-bold">
        {{ $t('study.dialog.label.contactInfo') }}
      </h5>
      <div v-if="hasMissingContactData()" class="placeholder">
        {{ $t('study.placeholder.missingContactData') }}
      </div>

      <div class="grid grid-cols-4 gap-4 lg:grid-cols-4">
        <div v-if="study?.contact?.institute" class="col-span-1">
          <h6 class="font-bold">{{ $t('study.dialog.label.institute') }}</h6>
          <div>{{ study.contact.institute }}</div>
        </div>
        <div
          v-if="study?.contact?.person && study?.contact?.person !== 'pending'"
          class="col-span-1"
        >
          <h6 class="font-bold">
            {{ $t('study.dialog.label.contactPerson') }}
          </h6>
          <div>{{ study.contact.person }}</div>
        </div>
        <div
          v-if="study?.contact?.email && study?.contact?.email !== 'pending'"
        >
          <h6 class="font-bold">{{ $t('study.dialog.label.contactEmail') }}</h6>
          <div>{{ study.contact.email }}</div>
        </div>
        <div v-if="study?.contact?.phoneNumber">
          <h6 class="font-bold">{{ $t('study.dialog.label.contactTel') }}</h6>
          <div>{{ study.contact.phoneNumber }}</div>
        </div>
      </div>
    </div>
  </div>
  <DynamicDialog />
</template>

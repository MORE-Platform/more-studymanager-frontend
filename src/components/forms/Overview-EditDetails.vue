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
  import dayjs from 'dayjs';
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
    //emit('onUpdateStudyStatus', status);

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
        if (options) {
          updateStudy(options.data as Study);
        }
      },
    });
  }

  const accessEditDetailsRoles: StudyRole[] = [
    StudyRole.Admin,
    StudyRole.Operator,
  ];
</script>

<template>
  <div class="overview-edit-details" :class="styleModifier">
    <div class="mb-8 flex justify-start">
      <div
        class="study-info-fixed grid grid-cols-3 gap-x-6 py-3 2xl:grid-cols-5"
        :style="
          props.userRoles.find((r) => r === StudyRole.Admin)
            ? 'width:89%;'
            : 'width:100%'
        "
      >
        <div>
          <span class="font-bold">{{ $t('study.props.plannedStart') }}: </span
          >{{ dayjs(study.plannedStart).format('DD/MM/YYYY') }}
        </div>
        <div>
          <span class="font-bold">{{ $t('study.props.actualStart') }}: </span>
          <span v-if="study.start">{{
            dayjs(study.start).format('DD/MM/YYYY')
          }}</span
          ><span v-else>-</span>
        </div>
        <div>
          <span class="font-bold">{{ $t('study.props.plannedEnd') }}: </span
          >{{ dayjs(study.plannedEnd).format('DD/MM/YYYY') }}
        </div>
        <div>
          <span class="font-bold">{{ $t('study.props.actualEnd') }}: </span>
          <span v-if="study.end">{{
            dayjs(study.end).format('DD/MM/YYYY')
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
          class="buttons"
          type="button"
          title="Edit Study Details"
          :disabled="(props.userRoles.some((r: StudyRole) => accessEditDetailsRoles.includes(r)) && props.study.status === StudyStatus.Paused ||
      props.userRoles.some((r: StudyRole) => accessEditDetailsRoles.includes(r)) && props.study.status === StudyStatus.Draft) === false"
          @click="openEditDialog()"
          ><span>{{ $t('global.labels.edit') }}</span></Button
        >
      </div>
    </div>

    <div class="mb-6">
      <h5>{{ $t('study.props.purpose') }}</h5>
      <div>
        <span v-if="study.purpose">{{ study.purpose }}</span>
        <span v-else class="placeholder">
          {{ $t('study.placeholder.emptyPurpose') }}
        </span>
      </div>
    </div>
    <div class="mb-6">
      <h5>{{ $t('study.props.participantInfo') }}</h5>
      <div>
        <span v-if="study.participantInfo">{{ study.participantInfo }}</span>
        <span v-else class="placeholder">
          {{ $t('study.placeholder.emptyParticipantInfo') }}</span
        >
      </div>
    </div>
    <div class="mb-6">
      <h5>{{ $t('study.props.consentInfo') }}</h5>
      <div class="mt-2">
        <span v-if="study.consentInfo">
          {{ study.consentInfo }}
        </span>
        <span v-else>{{ $t('study.placeholder.emptyConsentInfo') }}</span>
      </div>
    </div>
    <div class="mb-6">
      <h5>{{ $t('study.props.finishText') }}</h5>
      <div>
        <span v-if="study.finishText">{{ study.finishText }}</span>
        <span v-else class="placeholder">{{
          $t('study.placeholder.finishTextDesc')
        }}</span>
      </div>
    </div>
    <div class="mb-6">
      <h5 class="mb-1">{{ $t('study.dialog.label.contactInfo') }}</h5>
      <div
        v-if="
          (!study?.contact?.institute &&
            study?.contact?.person === 'pending' &&
            study?.contact?.email === 'pending' &&
            !study?.contact?.phoneNumber) ||
          (!study?.contact?.institute &&
            !study?.contact?.person &&
            !study?.contact?.email &&
            !study?.contact?.phoneNumber)
        "
        class="placeholder"
      >
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

<style scoped lang="postcss">
  :deep(.formatted-text) {
    ul {
      margin: 10px 0 10px 5px;
      list-style: disc;
      li {
        margin-left: 30px;
      }
    }
  }

  h5 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 2px;
  }
  button.edit-btn {
    border: none;
    background-color: transparent;
    padding: 0 !important;

    span:before {
      color: black;
    }

    &:hover,
    &:active,
    &:focus {
      background-color: lightgrey !important;
      span:before {
        color: var(--primary-color);
      }
    }
  }

  .overview-edit-details .placeholder {
    color: var(--surface-400);
  }
</style>

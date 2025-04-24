/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, reactive, ref, watch } from 'vue';
  import InputText from 'primevue/inputtext';
  import Calendar from 'primevue/calendar';
  import Textarea from 'primevue/textarea';
  import InputNumber from 'primevue/inputnumber';
  import Button from 'primevue/button';
  import { Contact, Duration, UnitEnum, Study } from '@gs';
  import { createLuxonDateTime, dateToDateString } from '../../utils/dateUtils';
  import { useI18n } from 'vue-i18n';
  import { useGlobalStore } from '../../stores/globalStore';
  import ErrorLabel from '../forms/ErrorLabel.vue';
  import { useErrorQueue } from '../../composable/useErrorHandling';
  import { calcStudyDuration } from '../../utils/studyUtils';
  import { scrollToFirstError } from '../../utils/componentUtils';
  import ContactInformation from './shared/ContactInformation.vue';
  import {
    validateEmail,
    validateTelephoneNumber,
  } from '../../utils/stringUtils';

  const dateFormat = useGlobalStore().getDateFormat;
  const dialogRef: any = inject('dialogRef');
  const { t } = useI18n();
  const study: Study = dialogRef.value.data?.study || {};
  const returnStudy: Study = reactive({
    studyId: study.studyId,
    title: study.title,
    purpose: study.purpose,
    plannedStart: undefined,
    plannedEnd: undefined,
    consentInfo: study.consentInfo,
    duration: {
      value: study.duration?.value,
      unit: study.duration?.unit,
    },
    participantInfo: study.participantInfo,
    contact: undefined,
    finishText: study.finishText,
  });
  const contact = ref<Contact>({
    person:
      study?.contact?.person !== 'pending' ? study?.contact?.person || '' : '',
    email:
      study.contact?.email !== 'pending' ? study?.contact?.email || '' : '',
    phoneNumber: study.contact?.phoneNumber ?? '',
    institute: study.contact?.institute ?? '',
  });

  const studyDuration: Duration = reactive({
    value: study.duration?.value,
    unit: study.duration?.unit ?? UnitEnum.Day,
  });
  const start = ref(
    study?.plannedStart ? new Date(study.plannedStart) : new Date(),
  );
  const end = ref(study?.plannedEnd ? new Date(study.plannedEnd) : new Date());
  const { errors, clearError, getError, addError, clearAllErrors } =
    useErrorQueue();
  const maxStudyDuration = ref<number>(0);

  function save(): void {
    returnStudy.plannedStart = dateToDateString(start.value);
    returnStudy.plannedEnd = dateToDateString(end.value);
    returnStudy.duration =
      studyDuration.value && studyDuration.unit ? studyDuration : undefined;
    returnStudy.contact = contact.value;

    if (!errors.value.length) {
      dialogRef.value.close(returnStudy);
    }
  }

  function checkRequiredFields(): void {
    clearAllErrors();

    if (!returnStudy.title) {
      addError({ label: 'title', value: t('study.error.addTitle') });
    }
    if (!returnStudy.consentInfo) {
      addError({
        label: 'consentInfo',
        value: t('study.error.addConsentInfo'),
      });
    }
    if (!returnStudy.participantInfo) {
      addError({
        label: 'participantInfo',
        value: t('study.error.addParticipantInfo'),
      });
    }

    const isEmailValid = validateEmail(contact.value?.email);

    if (!contact.value?.person && !isEmailValid) {
      addError({
        label: 'contactInfo',
        value: t('study.error.addContactInfo'),
      });
    } else if (!contact.value?.person) {
      addError({
        label: 'contactPerson',
        value: t('study.error.addContactPerson'),
      });
    } else if (!isEmailValid) {
      addError({
        label: 'contactEmail',
        value: t('study.error.addContactEmail'),
      });
    }

    if (
      contact.value?.phoneNumber &&
      !validateTelephoneNumber(contact.value?.phoneNumber)
    ) {
      addError({
        label: 'contactTel',
        value: t('study.error.addContactTel'),
      });
    }

    scrollToFirstError();
  }

  watch(
    [studyDuration, start, end],
    ([newDuration, newStart, newEnd]) => {
      if (newEnd < newStart) {
        end.value = newStart;
      }
      const maxDuration = calcStudyDuration(
        createLuxonDateTime(newStart),
        createLuxonDateTime(newEnd),
      );
      if (!maxDuration?.value) {
        return;
      } else {
        maxStudyDuration.value = maxDuration.value;
      }

      if (newDuration.value && newDuration.value > maxStudyDuration.value) {
        clearError('duration');
        addError({
          label: 'duration',
          value: t('study.error.durationSmallerThanStudySpan', {
            maxDuration: maxStudyDuration.value,
          }),
        });
      }
      scrollToFirstError();
    },
    { deep: true },
  );

  function cancel(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div>
    <form
      id="studyDialogForm"
      class="grid grid-cols-6 items-center gap-4"
      @submit.prevent="save"
    >
      <div class="col-start-0 col-span-6">
        <h5 class="text-lg font-bold" :class="{ 'mb-2': !getError('title') }">
          {{ $t('study.dialog.label.studyTitle') }}*
        </h5>
        <InputText
          id="name"
          v-model="returnStudy.title"
          class="w-full"
          type="text"
          required
          :placeholder="$t('study.placeholder.titleInput')"
          :name="'title'"
          @input="clearError('title')"
        />
        <ErrorLabel :error="getError('title')" class="col-span-8" />
      </div>
      <div class="col-span-5 col-start-2"></div>
      <div class="col-start-0 col-span-3">
        <h5 class="mb-2 text-lg font-bold">
          {{ $t('study.dialog.label.studyStart') }}*
        </h5>
        <Calendar
          v-model="start"
          class="w-full"
          :name="'start'"
          :min-date="
            study.plannedStart && new Date(study.plannedStart) < new Date()
              ? new Date(study.plannedStart)
              : new Date()
          "
          :placeholder="dateFormat"
          :date-format="dateFormat"
          autocomplete="off"
        />
      </div>
      <div class="col-start-0 col-span-3">
        <h5 class="mb-2 text-lg font-bold">
          {{ $t('study.dialog.label.studyEnd') }}*
        </h5>
        <Calendar
          v-model="end"
          class="w-full"
          :name="'end'"
          :placeholder="dateFormat"
          :date-format="dateFormat"
          autocomplete="off"
          :min-date="start"
        />
      </div>
      <div class="ol-start-0 col-span-6">
        <h5
          class="text-lg font-bold"
          :class="{ 'mb-2': !getError('duration') }"
        >
          {{ $t('study.props.duration') }}
        </h5>
        <div class="mb-2">{{ $t('study.dialog.description.duration') }}</div>
        <div class="examples mb-1.5 rounded-md p-2">
          <div class="color-primary font-medium">
            {{ $t('study.dialog.label.durationExample') }}
          </div>
          <div class="mt-0.5">
            {{
              $t('study.dialog.description.durationExample', {
                egStartDate: $d(new Date('2023-07-01'), 'short'),
                egEndDate: $d(new Date('2023-12-31'), 'short'),
              })
            }}
          </div>
        </div>
        <div class="flex w-full flex-nowrap items-center gap-2">
          <InputNumber
            v-model="studyDuration.value"
            class="w-full"
            :name="'duration_input'"
            :placeholder="$t('study.placeholder.durationInput')"
            :auto-resize="true"
            :min="0"
            @input="clearError('duration')"
          />
          <span class="w-fit">
            {{ $t('scheduler.frequency.days') }}
          </span>
        </div>
        <ErrorLabel :error="getError('duration')" class="col-span-8" />
      </div>
      <div class="col-start-0 col-span-6">
        <h5 class="mb-2 text-lg font-bold">
          {{ $t('study.props.purpose') }}
        </h5>
        <div class="mb-2">{{ $t('study.dialog.description.purpose') }}</div>
        <Textarea
          v-model="returnStudy.purpose"
          class="w-full"
          :name="'purpose'"
          :placeholder="$t('study.placeholder.purposeInput')"
          :auto-resize="true"
        />
      </div>
      <div class="col-start-0 col-span-6">
        <h5
          class="text-lg font-bold"
          :class="{ 'mb-2': !getError('participantInfo') }"
        >
          {{ $t('study.props.participantInfo') }}*
        </h5>

        <div class="mb-2">
          {{ $t('study.dialog.description.participantInfo') }}
        </div>
        <Textarea
          v-model="returnStudy.participantInfo"
          class="w-full"
          :required="true"
          :name="'participantInfo'"
          :placeholder="$t('study.placeholder.participantInfoInput')"
          :auto-resize="true"
          @input="clearError('participantInfo')"
        />
        <ErrorLabel :error="getError('participantInfo')" class="col-span-8" />
      </div>
      <div class="col-start-0 col-span-6">
        <h5
          class="text-lg font-bold"
          :class="{ 'mb-2': !getError('consentInfo') }"
        >
          {{ $t('study.props.consentInfo') }}*
        </h5>

        <div class="mb-2">
          {{ $t('study.dialog.description.consentInfo') }}
        </div>
        <Textarea
          v-model="returnStudy.consentInfo"
          class="w-full"
          :name="'consentInfo'"
          :required="true"
          :placeholder="$t('study.placeholder.consentInfoInput')"
          :auto-resize="true"
          @input="clearError('consentInfo')"
        />
        <ErrorLabel :error="getError('consentInfo')" class="col-span-8" />
      </div>
      <div class="col-start-0 col-span-6">
        <h5 class="mb-2 text-lg font-bold">
          {{ $t('study.props.finishText') }}
        </h5>
        <div class="mb-2">{{ $t('study.placeholder.finishTextDesc') }}</div>
        <Textarea
          v-model="returnStudy.finishText"
          class="w-full"
          :name="'finishText'"
          :placeholder="$t('study.placeholder.finishText')"
          auto-rezise="true"
        />
      </div>
      <ContactInformation v-model="contact" />
      <div class="buttons col-start-0 col-span-6 mt-1 justify-end text-right">
        <Button
          class="btn-gray"
          :label="$t('global.labels.cancel')"
          @click="cancel()"
        />
        <Button
          class="!ml-2"
          type="submit"
          :label="$t('global.labels.save')"
          :disabled="errors.length > 0"
          @click="checkRequiredFields"
        />
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
  .examples {
    background-color: var(--gray-100);
  }
</style>

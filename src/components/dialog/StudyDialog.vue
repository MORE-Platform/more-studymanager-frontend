/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, onUpdated, reactive, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Calendar from 'primevue/calendar';
  import Textarea from 'primevue/textarea';
  import InputNumber from 'primevue/inputnumber';
  import Button from 'primevue/button';
  import {
    Study,
    Duration,
    DurationUnitEnum,
  } from '../../generated-sources/openapi';
  import { dateToDateString } from '../../utils/dateUtils';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import Dropdown from 'primevue/dropdown';

  const dialogRef: any = inject('dialogRef');
  const study: Study = dialogRef.value.data?.study || {};
  const { t } = useI18n();

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

  const studyDuration: Duration = reactive({
    value: study.duration?.value,
    unit: study.duration?.unit,
  });

  const durationUnitOptions = [
    {
      label: 'Nothing selected',
      value: undefined,
    },
    {
      label: t('scheduler.preview.unit.MINUTE'),
      value: DurationUnitEnum.Minute,
    },
    {
      label: t('scheduler.preview.unit.HOUR'),
      value: DurationUnitEnum.Hour,
    },
    {
      label: t('scheduler.preview.unit.DAY'),
      value: DurationUnitEnum.Day,
    },
  ];

  const start = ref(
    study
      ? study.plannedStart
        ? new Date(study.plannedStart)
        : new Date()
      : new Date(),
  );
  const end = ref(
    study
      ? study.plannedEnd
        ? new Date(study.plannedEnd)
        : new Date()
      : new Date(),
  );

  const contactInstitute: Ref<string> = ref(study.contact?.institute ?? '');
  const contactPerson: Ref<string> = ref(
    study.contact?.person && study.contact?.person !== 'pending'
      ? study.contact.person
      : '',
  );
  const contactEmail: Ref<string> = ref(
    study.contact?.email && study.contact?.email !== 'pending'
      ? study.contact.email
      : '',
  );
  const contactPhoneNumber: Ref<string> = ref(study.contact?.phoneNumber ?? '');

  function save() {
    returnStudy.plannedStart = dateToDateString(start.value);
    returnStudy.plannedEnd = dateToDateString(end.value);
    returnStudy.duration =
      studyDuration.value && studyDuration.unit ? studyDuration : undefined;

    returnStudy.contact = {
      institute: contactInstitute.value,
      person: contactPerson.value,
      email: contactEmail.value,
      phoneNumber: contactPhoneNumber.value,
    };
    if (!errors.length) {
      dialogRef.value.close(returnStudy);
    }
  }

  let errors: MoreTableChoice[] = [];

  function checkRequiredFields() {
    errors = [];
    if (!returnStudy.title) {
      errors.push({ label: 'title', value: t('study.error.addTitle') });
    }
    if (
      (!studyDuration.value && studyDuration.unit) ||
      (studyDuration.value && !studyDuration.unit)
    ) {
      errors.push({
        label: 'duration',
        value: t('study.error.addDuration'),
      });
    }
    if (!returnStudy.consentInfo) {
      errors.push({
        label: 'consentInfo',
        value: t('study.error.addConsentInfo'),
      });
    }
    if (!returnStudy.participantInfo) {
      errors.push({
        label: 'participantInfo',
        value: t('study.error.addParticipantInfo'),
      });
    }
    if (!contactPerson.value && !contactEmail.value) {
      errors.push({
        label: 'contactInfo',
        value: t('study.error.addContactInfo'),
      });
    } else if (!contactPerson.value) {
      errors.push({
        label: 'contactPerson',
        value: t('study.error.addContactPerson'),
      });
    } else if (!contactEmail.value) {
      errors.push({
        label: 'contactEmail',
        value: t('study.error.addContactEmail'),
      });
    }
  }

  function getError(label: string): string | null | undefined {
    return errors.find((el) => el.label === label)?.value;
  }

  onUpdated(() => {
    if (end.value < start.value) {
      end.value = start.value;
    }
  });

  function cancel() {
    dialogRef.value.close();
  }
</script>

<template>
  <div>
    <form
      id="studyDialogForm"
      class="grid grid-cols-6 items-center gap-4"
      @submit.prevent="save()"
    >
      <div class="col-start-0 col-span-6">
        <h5 class="text-lg font-bold" :class="{ 'mb-2': !getError('title') }">
          {{ $t('study.dialog.label.studyTitle') }}*
        </h5>
        <div v-if="getError('title')" class="error col-span-8 mb-2">
          {{ getError('title') }}
        </div>
        <InputText
          id="name"
          v-model="returnStudy.title"
          class="w-full"
          type="text"
          required
          :placeholder="$t('study.placeholder.titleInput')"
          :name="'title'"
        ></InputText>
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
          :placeholder="$t('dateFormat')"
          :date-format="$t('dateFormat')"
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
          :placeholder="$t('dateFormat')"
          :date-format="$t('dateFormat')"
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
        <div v-if="getError('duration')" class="error col-span-8 mb-2">
          {{ getError('duration') }}
        </div>
        <div class="mb-2">{{ $t('study.dialog.description.duration') }}</div>
        <div class="examples mb-1.5 rounded-md p-2">
          <div class="color-primary font-medium">
            {{ $t('study.dialog.label.durationExample') }}
          </div>
          <div class="mt-0.5">
            {{ $t('study.dialog.description.durationExample') }}
          </div>
        </div>
        <div class="grid grid-cols-6 items-center gap-4">
          <InputNumber
            v-model="studyDuration.value"
            class="col-span-4 w-full"
            :name="'duration'"
            :placeholder="$t('study.placeholder.durationInput')"
            :auto-resize="true"
            @input="checkRequiredFields"
          ></InputNumber>
          <Dropdown
            v-model="studyDuration.unit"
            class="col-span-2 w-full"
            :options="durationUnitOptions"
            :name="'duration'"
            option-label="label"
            option-value="value"
            :placeholder="$t('study.placeholder.durationInput')"
            @change="checkRequiredFields"
          />
        </div>
      </div>
      <div class="col-start-0 col-span-6">
        <h5 class="mb-2 text-lg font-bold">{{ $t('study.props.purpose') }}</h5>
        <div class="mb-2">{{ $t('study.dialog.description.purpose') }}</div>
        <Textarea
          v-model="returnStudy.purpose"
          class="w-full"
          :name="'purpose'"
          :placeholder="$t('study.placeholder.purposeInput')"
          :auto-resize="true"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-6">
        <h5
          class="text-lg font-bold"
          :class="{ 'mb-2': !getError('participantInfo') }"
        >
          {{ $t('study.props.participantInfo') }}*
        </h5>
        <div v-if="getError('participantInfo')" class="error col-span-8 mb-2">
          {{ getError('participantInfo') }}
        </div>
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
        />
      </div>
      <div class="col-start-0 col-span-6">
        <h5
          class="text-lg font-bold"
          :class="{ 'mb-2': !getError('consentInfo') }"
        >
          {{ $t('study.props.consentInfo') }}*
        </h5>
        <div v-if="getError('consentInfo')" class="error col-span-8 mb-2">
          {{ getError('consentInfo') }}
        </div>
        <div class="mb-2">{{ $t('study.dialog.description.consentInfo') }}</div>
        <Textarea
          v-model="returnStudy.consentInfo"
          class="w-full"
          :name="'consentInfo'"
          :required="true"
          :placeholder="$t('study.placeholder.consentInfoInput')"
          :auto-resize="true"
        />
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
      <div class="col-span-6 mb-4 mt-2">
        <h5 class="mb-2 text-lg font-bold">
          {{ $t('study.dialog.label.contactInfo') }}*
        </h5>
        <div v-if="getError('contactInfo')" class="error col-span-8 mb-2">
          {{ getError('contactInfo') }}
        </div>
        <div
          v-else-if="getError('contactPerson')"
          class="error col-span-8 mb-2"
        >
          {{ getError('contactPerson') }}
        </div>
        <div v-else-if="getError('contactEmail')" class="error col-span-8 mb-2">
          {{ getError('contactEmail') }}
        </div>
        <div class="mb-3">{{ $t('study.dialog.description.contactData') }}</div>
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-3">
            <h6 class="mb-1 font-medium">
              {{ $t('study.dialog.label.institute') }}
            </h6>
            <InputText
              v-model="contactInstitute"
              class="w-full"
              type="text"
              :placeholder="t('study.placeholder.institute')"
            />
          </div>
          <div class="col-span-3">
            <h6 class="mb-1 font-medium">
              {{ $t('study.dialog.label.contactPerson') }}*
            </h6>
            <InputText
              v-model="contactPerson"
              required
              type="text"
              class="w-full"
              :placeholder="t('study.placeholder.contactPerson')"
            />
          </div>
          <div class="col-span-3">
            <h6 class="mb-1 font-medium">
              {{ $t('study.dialog.label.contactEmail') }}*
            </h6>
            <InputText
              v-model="contactEmail"
              class="w-full"
              required
              type="email"
              :placeholder="t('study.placeholder.contactEmail')"
            />
          </div>
          <div class="col-span-3">
            <h6 class="mb-1 font-medium">
              {{ $t('study.dialog.label.contactTel') }}
            </h6>
            <InputText
              v-model="contactPhoneNumber"
              class="w-full"
              type="tel"
              :placeholder="t('study.placeholder.contactTel')"
            />
          </div>
        </div>
      </div>
      <div class="buttons col-start-0 col-span-6 mt-1 justify-end text-right">
        <Button class="btn-gray" @click="cancel()"
          >{{ $t('global.labels.cancel') }}
        </Button>
        <Button class="!ml-2" type="submit" @click="checkRequiredFields()"
          >{{ $t('global.labels.save') }}
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
  .examples {
    background-color: var(--gray-100);
  }
</style>

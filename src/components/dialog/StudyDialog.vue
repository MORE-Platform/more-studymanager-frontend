<script setup lang="ts">
  import { inject, onUpdated, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Calendar from 'primevue/calendar';
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import { Study } from '../../generated-sources/openapi';
  import { dateToDateString } from '../../utils/dateUtils';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';

  const dialogRef: any = inject('dialogRef');
  const study: Study = dialogRef.value.data?.study || {};
  const { t } = useI18n();
  const language = ref('en');

  const returnStudy: Ref<Study> = ref({
    studyId: study.studyId,
    title: study.title,
    purpose: study.purpose,
    plannedStart: undefined,
    plannedEnd: undefined,
    consentInfo: study.consentInfo,
    participantInfo: study.participantInfo,
    contact: {
      institute: study.contact?.institute,
      contactPerson: study.contact?.contactPerson,
      contactEmail: study.contact?.contactEmail,
      contactPhoneNumber: study.contact?.contactPhoneNumber,
    }
  }) as Ref<Study>;

  const start = ref(
    study
      ? study.plannedStart
        ? new Date(study.plannedStart)
        : new Date()
      : new Date()
  );
  const end = ref(
    study
      ? study.plannedEnd
        ? new Date(study.plannedEnd)
        : new Date()
      : new Date()
  );

  const languages = [
    { name: 'German', value: 'de' },
    { name: 'English', value: 'en' },
  ];

  function save() {
    returnStudy.value.plannedStart = dateToDateString(start.value);
    returnStudy.value.plannedEnd = dateToDateString(end.value);

    dialogRef.value.close(returnStudy.value);
  }

  const errors: Ref<Array<MoreTableChoice>> = ref([]);

  function checkRequiredFields() {
    errors.value = [];
    if (!returnStudy.value.title) {
      errors.value.push({ label: 'title', value: t('study.error.addTitle') });
    }
    if (!returnStudy.value.consentInfo) {
      errors.value.push({
        label: 'consentInfo',
        value: t('study.error.addConsentInfo'),
      });
    }
    if (!returnStudy.value.participantInfo) {
      errors.value.push({
        label: 'participantInfo',
        value: t('study.error.addParticipantInfo'),
      });
    }
    if (!returnStudy.value.contact?.contactPerson && !returnStudy.value.contact?.contactEmail) {
      errors.value.push({
        label: 'contactInfo',
        value: t('study.error.addContactInfo'),
      });
    } else if (!returnStudy.value.contact?.contactPerson) {
      errors.value.push({
        label: 'contactPerson',
        value: t('study.error.addContactPerson'),
      });
    } else if (!returnStudy.value.contact?.contactEmail) {
      errors.value.push({
        label: 'contactEmail',
        value: t('study.error.addContactEmail'),
      });
    }
    console.log(errors.value);
  }

  function getError(label: string): string | null | undefined {
    const item = errors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
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
    <div class="mb-4">
      <!-- eslint-disable vue/no-v-html -->
      <h6 v-html="$t('study.dialog.description.study')"></h6>
    </div>
    <form
      id="studyDialogForm"
      class="grid grid-cols-6 items-center gap-4"
      @submit.prevent="save()"
    >
      <div class="col-start-0 col-span-6">
        <h5 :class="getError('title') ? '' : 'mb-2'">
          {{ $t('study.dialog.label.studyTitle') }}*
        </h5>
        <div v-if="getError('title')" class="error col-span-8 mb-2">
          {{ getError('title') }}
        </div>
        <InputText
          id="name"
          v-model="returnStudy.title"
          type="text"
          required
          :placeholder="$t('study.placeholder.titleInput')"
          style="width: 100%"
          :name="'title'"
        ></InputText>
      </div>
      <div class="col-span-5 col-start-2"></div>
      <div class="col-start-0 col-span-2">
        <h5 class="mb-2">{{ $t('study.props.language') }}</h5>
        <Dropdown
          v-model="language"
          style="width: 100%"
          :options="languages"
          :name="'language'"
          option-label="name"
          option-value="value"
          :placeholder="t('study.placeholder.selectLanguage')"
        />
      </div>
      <div class="col-start-0 col-span-2">
        <h5 class="mb-2">{{ $t('study.dialog.label.studyStart') }}*</h5>
        <Calendar
          v-model="start"
          :name="'start'"
          :min-date="
            study.plannedStart && new Date(study.plannedStart) < new Date()
              ? new Date(study.plannedStart)
              : new Date()
          "
          placeholder="dd/mm/yyyy"
          date-format="dd/mm/yy"
          autocomplete="off"
          style="width: 100%"
        />
      </div>
      <div class="col-start-0 col-span-2">
        <h5 class="mb-2">{{ $t('study.dialog.label.studyEnd') }}*</h5>
        <Calendar
          v-model="end"
          :name="'end'"
          placeholder="dd/mm/yyyy"
          date-format="dd/mm/yy"
          autocomplete="off"
          :min-date="start"
          style="width: 100%"
        />
      </div>
      <div class="col-start-0 col-span-6">
        <h5 class="mb-2">{{ $t('study.props.purpose') }}</h5>
        <div class="mb-2">{{ $t('study.dialog.description.purpose') }}</div>
        <Textarea
          v-model="returnStudy.purpose"
          :name="'purpose'"
          :placeholder="$t('study.placeholder.purposeInput')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-6">
        <h5 :class="getError('participantInfo') ? '' : 'mb-2'">
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
          :required="true"
          :name="'participantInfo'"
          :placeholder="$t('study.placeholder.participantInfoInput')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-6">
        <h5 :class="getError('consentInfo') ? '' : 'mb-2'">
          {{ $t('study.props.consentInfo') }}*
        </h5>
        <div v-if="getError('consentInfo')" class="error col-span-8 mb-2">
          {{ getError('consentInfo') }}
        </div>
        <div class="mb-2">{{ $t('study.dialog.description.consentInfo') }}</div>
        <Textarea
          v-model="returnStudy.consentInfo"
          :name="'consentInfo'"
          :required="true"
          :placeholder="$t('study.placeholder.consentInfoInput')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-span-6 mb-4 mt-2">
        <h5
          class="mb-2 font-bold"
          :class="
            getError('contactInfo') ||
            getError('contactPerson') ||
            getError('contactEmail')
              ? ''
              : 'mb-2'
          "
        >
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
              v-model="returnStudy.contact.institute"
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
              v-model="returnStudy.contact.contactPerson"
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
              v-model="returnStudy.contact.contactEmail"
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
              v-model="returnStudy.contact.contactPhoneNumber"
              class="w-full"
              type="tel"
              :placeholder="t('study.placeholder.contactTel')"
            />
          </div>
        </div>
      </div>
      <div class="buttons col-start-0 col-span-6 mt-1 justify-end text-right">
        <Button class="btn-gray" @click="cancel()">{{
          $t('global.labels.cancel')
        }}</Button>
        <Button type="submit" @click="checkRequiredFields()">{{
          $t('global.labels.save')
        }}</Button>
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
  .buttons {
    button {
      margin-left: 10px;
    }
  }
  h5 {
    font-size: 18px;
    font-weight: bold;
  }
</style>

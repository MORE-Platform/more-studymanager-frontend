<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Calendar from 'primevue/calendar';
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import { Study } from '../../generated-sources/openapi';
  import { dateToDateString } from '../../utils/dateUtils';

  const dialogRef: any = inject('dialogRef');
  const study: Study = dialogRef.value.data?.study || {};
  const language = ref('en');

  const returnStudy: Ref<Study> = ref({
    studyId: study.studyId,
    title: study.title,
    purpose: study.purpose,
    plannedStart: undefined,
    plannedEnd: undefined,
    consentInfo: study.consentInfo,
    participantInfo: study.participantInfo,
  }) as Ref<Study>;

  const start = ref(study.start ? new Date(study.start) : new Date());
  const end = ref(study.end ? new Date(study.end) : new Date());

  const languages = [
    { name: 'German', value: 'de' },
    { name: 'English', value: 'en' },
  ];

  function save() {
    returnStudy.value.plannedStart = dateToDateString(start.value);
    returnStudy.value.plannedEnd = dateToDateString(end.value);

    dialogRef.value.close(returnStudy.value);
  }

  const errors: Ref<Array<any>> = ref([]);

  function checkRequiredFields() {
    errors.value = [];
    if (!returnStudy.value.title) {
      errors.value.push('Study Title');
    }
    if (!returnStudy.value.consentInfo) {
      errors.value.push('Consent Information');
    }
    if (!returnStudy.value.participantInfo) {
      errors.value.push('Participant Information');
    }
  }

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
      <div v-if="errors.length" class="error col-span-6">
        <span class="font-medium">
          Please fill out following information fields:
        </span>
        <ul>
          <li
            v-for="(error, index) in errors"
            :key="index"
            class="inline-block"
          >
            {{ error }}
            <span v-if="index < errors.length - 1" class="mr-0.5">,</span>
          </li>
        </ul>
      </div>
      <div class="col-start-0 col-span-1">
        <h5>Study Title</h5>
      </div>
      <div class="col-span-5 col-start-2">
        <InputText
          id="name"
          v-model="returnStudy.title"
          type="text"
          required
          :placeholder="$t('placeholder.title')"
          style="width: 100%"
          :name="'title'"
        ></InputText>
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Language</h5>
        <Dropdown
          v-model="language"
          style="width: 100%"
          :options="languages"
          :name="'language'"
          option-label="name"
          option-value="value"
          placeholder="Select a language"
        />
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Study Start</h5>
        <Calendar
          v-model="start"
          :name="'start'"
          placeholder="dd/mm/yyyy"
          date-format="dd/mm/yy"
          autocomplete="off"
          style="width: 100%"
        />
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Study End</h5>
        <Calendar
          v-model="end"
          :name="'end'"
          placeholder="dd/mm/yyyy"
          date-format="dd/mm/yy"
          autocomplete="off"
          style="width: 100%"
        />
      </div>
      <div class="col-start-0 col-span-6">
        <h5>Purpose</h5>
        <Textarea
          v-model="returnStudy.purpose"
          :name="'purpose'"
          :placeholder="$t('placeholder.purpose')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-6">
        <h5>{{ $t('participantInfo') }}</h5>
        <Textarea
          v-model="returnStudy.participantInfo"
          :required="true"
          :name="'participantInfo'"
          :placeholder="$t('placeholder.participantInfo')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-6">
        <h5>{{ $t('consentInfo') }}</h5>
        <Textarea
          v-model="returnStudy.consentInfo"
          :name="'consentInfo'"
          :required="true"
          :placeholder="$t('placeholder.consentInfo')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="buttons col-start-0 col-span-6 mt-8 justify-end text-right">
        <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
        <Button type="submit" @click="checkRequiredFields()">Save</Button>
      </div>
    </form>
  </div>
</template>

<style lang="postcss">
  .buttons {
    button {
      margin-left: 10px;
    }
  }
</style>

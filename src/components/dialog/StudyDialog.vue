<template>
  <div>
    <div class="grid grid-cols-6 gap-4 items-center">
      <div class="col-start-0 col-span-1"><h5>Study Title</h5></div>
      <div class="col-start-2 col-span-5">
        <InputText v-model="title" :placeholder="$t('placeholder.title')" style="width: 100%"></InputText>
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Language</h5>
        <Dropdown v-model="language" style="width: 100%;" :options="languages" option-label="name" option-value="value" placeholder="Select a language" />
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Study Start</h5>
        <Calendar v-model="start" placeholder="dd/mm/yyyy" autocomplete="off" style="width: 100%"/>
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Study End</h5>
        <Calendar v-model="end" placeholder="dd/mm/yyyy" autocomplete="off" style="width: 100%"/>
      </div>
      <div class="col-start-0 col-span-6">
        <h5>Purpose</h5>
        <Textarea v-model="purpose" :placeholder="$t('placeholder.purpose')" :auto-resize="true" style="width: 100%"></Textarea>
      </div>
      <div class="col-start-0 col-span-6">
        <h5>{{ $t('participantInfo') }}</h5>
        <Textarea v-model="participantInfo" :placeholder="$t('placeholder.participantInfo')" :auto-resize="true" style="width: 100%"></Textarea>
      </div>
      <div class="col-start-0 col-span-6">
        <h5>{{$t('consentInfo')}}</h5>
        <Textarea v-model="consentInfo" :placeholder="$t('placeholder.consentInfo')" :auto-resize="true" style="width: 100%"></Textarea>
      </div>
    </div>
    <div class="buttons text-right mt-8">
      <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
      <Button @click="save()">Save</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {inject, ref} from 'vue';
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import {Study} from '../../generated-sources/openapi';
import {dateToDateString} from '../../utils/dateUtils';

const dialogRef:any = inject("dialogRef");
const study:Study = dialogRef.value.data?.study || {};

const title = ref(study.title);
const language = ref('en');
const start = ref(study.start ?  new Date(study.start): new Date());
const end = ref(study.end ? new Date(study.end): new Date());
const purpose = ref(study.purpose);
const consentInfo = ref(study.consentInfo);
const participantInfo = ref(study.participantInfo);


const languages = [
  {name: 'German', value: 'de'},
  {name: 'English', value: 'en'}
]

function save(){
  const returnStudy = {
    studyId: study.studyId,
    title: title.value,
    purpose: purpose.value,
    plannedStart: dateToDateString(start.value),
    plannedEnd: dateToDateString(end.value),
    consentInfo: consentInfo.value,
    participantInfo: participantInfo.value
  } as Study;
  dialogRef.value.close(returnStudy);
}

function cancel() {
  dialogRef.value.close();
}

</script>

<style lang="postcss">
  .buttons {
    button {
      margin-left: 10px;
    }
  }
</style>

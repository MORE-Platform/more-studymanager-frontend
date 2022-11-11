<template>
  <div>
    <div class="grid grid-cols-6 gap-4 items-center">
      <div class="col-start-0 col-span-1"><h5>Study Title</h5></div>
      <div class="col-start-2 col-span-5">
        <InputText v-model="title" style="width: 100%"></InputText>
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Language</h5>
        <Dropdown v-model="language" style="width: 100%;" :options="languages" option-label="name" option-value="value" placeholder="Select a language" />
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Study Start</h5>
        <Calendar v-model="start" autocomplete="off" style="width: 100%"/>
      </div>
      <div class="col-start-0 col-span-2">
        <h5>Study End</h5>
        <Calendar v-model="end" autocomplete="off" style="width: 100%"/>
      </div>
      <div class="col-start-0 col-span-6">
        <h5>Purpose</h5>
        <Textarea v-model="purpose" :auto-resize="true" style="width: 100%"></Textarea>
      </div>
    </div>
    <div class="buttons text-right mt-8">
      <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
      <Button @click="create()">Create</Button>
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

const title = ref();
const language = ref();
const start = ref();
const end = ref();
const purpose = ref();

const languages = [
  {name: 'German', value: 'de'},
  {name: 'English', value: 'en'}
]

function create() {
  console.log(title.value, language.value, start.value, end.value, purpose.value);
  const study = {
    title: title.value,
    purpose: purpose.value,
    plannedStart: dateToDateString(start.value),
    plannedEnd: dateToDateString(end.value)
  } as Study;
  dialogRef.value.close(study);
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

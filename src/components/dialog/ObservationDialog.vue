<script setup lang="ts">
import {inject, ref} from 'vue';
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import {Observation} from '../../generated-sources/openapi';

const dialogRef:any = inject("dialogRef")
//const observation:Observation = dialogRef.value.data?.observation || {};
//grouplist example: {statuses: [{label: 'string', value: 'string'}, {label: 'mine', value: 'mine'}], placeholder: 'test'}
const observationType = dialogRef.value.data?.observationType || undefined;
const groupStates = dialogRef.value.data?.groupStates || undefined;
const groupPlaceholder = dialogRef.value.data?.groupPlaceholder || 'Choos a group';

const title = ref();
const purpose = ref();
const participantInfo = ref()
const properties = ref({});
const scheduler = ref({})
const studyGroupId = ref()


function save(){
  const returnObservation = {
    title: title.value,
    purpose: purpose.value,
    participantInfo: participantInfo.value,
    type: observationType.value,
    properties: properties.value,
    scheduler: scheduler.value,
  } as Observation;

  dialogRef.value.close(returnObservation);
}


function cancel() {
 dialogRef.value.close();
}

</script>

<template>
  <div class="obervation-dialog">
    <div class="mb-4"><span class="font-bold">Type: </span> {{ observationType.label }} ({{observationType.value}})</div>

   <div class="grid grid-cols-8 gap-4 items-center">

     <div class="col-start-0 col-span-2"><h5>{{ $t('observation') }} {{ $t('title') }}</h5></div>
     <div class="col-start-3 col-span-6">
       <InputText v-model="title" placeholder="Enter the study title." style="width: 100%"></InputText>
     </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">{{ $t('purpose') }}</h5>
      <Textarea v-model="purpose" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
    </div>

    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">{{ $t('participantInfo') }}</h5>
      <Textarea v-model="participantInfo" placeholder="Enter the participant information, which will be displayed on the app." :auto-resize="true" style="width: 100%"></Textarea>
    </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">Configuration</h5>
      <div class="col-start-0 col-span-8">
        <h6 class="mb-1">Config(Json)</h6>
        <Textarea v-model="properties" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
      </div>
    </div>

     <div class="col-start-0 col-span-8">
       <Dropdown v-model="studyGroupId" :options="groupStates" option-label="label" option-value="value" :placeholder="$t(groupPlaceholder)">
         <template #option="optionProps">
           <div class="p-dropdown-car-option">
             <span>{{optionProps.option.label}}</span>
           </div>
         </template>
       </Dropdown>
     </div>


  <div class=" col-start-0 col-span-8 buttons text-right mt-8 justify-end">
    <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
    <Button @click="save()">Save</Button>
  </div>

   </div>
  </div>
</template>


<style lang="postcss">
.buttons {
  button {
    margin-left: 10px;
  }
}
</style>

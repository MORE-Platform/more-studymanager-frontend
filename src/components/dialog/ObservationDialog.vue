<script setup lang="ts">
import {inject, ref} from 'vue';
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import {Observation} from '../../generated-sources/openapi';

const dialogRef:any = inject("dialogRef")
const observation:Observation = dialogRef.value.data?.study || {};
//grouplist example: {statuses: [{label: 'string', value: 'string'}, {label: 'mine', value: 'mine'}], placeholder: 'test'}
const groupList = dialogRef.value.data?.groupList || undefined;

const title = ref("title");
const purpose = ref("purpose");
const participantInfo = ref("participantInfo")
const properties = ref({});
const scheduler = ref({})
const studyGroupId = ref("studyGroupId")

function save(){
  const returnObservation = {
    observationId: observation.observationId,
    title: title.value,
    purpose: purpose.value,
    participantInfo: participantInfo.value,
    type: observation.type,
    properties: properties.value,
    scheduler: scheduler.value
  } as Observation;
  dialogRef.value.close(returnObservation);
}

function cancel() {
 dialogRef.value.close();
}

</script>

<template>
  <div class="obervation-dialog">
    <div><span class="font-bold">Type: </span> {{ observation.type }}</div>

     <div class="grid grid-cols-6 gap-4 items-center">
       <div class="col-start-0 col-span-1"><h5>{{ $t('observation') }} {{ $t('title') }}</h5></div>
       <div class="col-start-2 col-span-5">
         <InputText v-model="title" placeholder="Enter the study title." style="width: 100%"></InputText>
       </div>
       <div class="col-start-0 col-span-6">
         <h5>{{ $t('purpose') }}</h5>
         <Textarea v-model="purpose" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
       </div>
       <div class="col-start-0 col-span-6">
         <h5>{{ $t('participantInfo') }}</h5>
         <Textarea v-model="participantInfo" placeholder="Enter the participant information, which will be displayed on the app." :auto-resize="true" style="width: 100%"></Textarea>
       </div>
       <div>To-do: enter scheduler</div>

       <div class="col-start-0 col-span-6">
         <h5 class="mb-2">Configuration</h5>
         <div class="col-start-0 col-span-6">
           <h6>Config(Json)</h6>
           <Textarea v-model="purpose" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
         </div>
       </div>

       <div class="col-start-0 col-span-3">
         <Dropdown v-model="studyGroupId" :options="groupList.statuses" option-label="label" option-value="value" :placeholder="$t(groupList.placeholder)">
           <template #option="optionProps">
             <div class="p-dropdown-car-option">
               <span>{{optionProps.option.label}}</span>
             </div>
           </template>
         </Dropdown>
       </div>

       <div class="buttons text-right mt-8">
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

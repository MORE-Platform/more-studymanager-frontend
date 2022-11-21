<script setup lang="ts">
import {inject, ref, Ref} from 'vue';
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import {Observation} from '../../generated-sources/openapi';
import {MoreTableChoice} from "../../models/MoreTableModel";

const dialogRef:any = inject("dialogRef")
const observation = dialogRef.value.data.observation as Observation;
const groupStates = dialogRef.value.data.groupStates || [];

const title = ref(observation.title);
const purpose = ref(observation.purpose);
const participantInfo = ref(observation.participantInfo)
const properties = ref(observation.properties ? JSON.stringify(observation.properties) : '{}');
const scheduler = ref()
const studyGroupId = ref(observation.studyGroupId)

const jsonError: Ref<String>= ref('')

function getLabelForChoiceValue(value: any, values: MoreTableChoice[]) {
  if(value) {
    const v = value.toString()
    return values.find((s: any) => s.value === v)?.label;
  }
    return undefined;
}

function save(){
  try {
    const props = JSON.parse(properties.value.toString())

    const returnObservation = {
      observationId: observation.observationId,
      title: title.value,
      purpose: purpose.value,
      participantInfo: participantInfo.value,
      type: observation.type,
      properties: props,
      scheduler: scheduler.value,
      studyGroupId: studyGroupId.value
    } as Observation;

    dialogRef.value.close(returnObservation);
  } catch (e) {
    jsonError.value = 'Please enter a valid json inside the Config (Json) field.'
  }
}

function typeNameForId(id: string) {
  //TODO
  return id;
}

function cancel() {
 dialogRef.value.close();
}
</script>

<template>
  <div class="obervation-dialog">
    <div class="mb-4"><span class="font-bold">Type: </span> {{ typeNameForId(observation.type)}}</div>
   <div class="grid grid-cols-8 gap-4 items-center">
     <div class="col-start-0 col-span-2"><h5>{{ $t('observation') }} {{ $t('title') }}</h5></div>
     <div class="col-start-3 col-span-6">
       <InputText v-model="title" placeholder="Enter the study title." style="width: 100%"></InputText>
     </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">{{ $t('purpose') }}*</h5>
      <Textarea v-model="purpose" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
    </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">{{ $t('participantInfo') }}</h5>
      <Textarea v-model="participantInfo" placeholder="Enter the participant information, which will be displayed on the app." :auto-resize="true" style="width: 100%"></Textarea>
    </div>
    <div class="col-start-0 col-span-8">
      <h5 class="mb-2">Configuration</h5>
      <div v-if="jsonError" class="error mb-3">{{jsonError}}</div>
      <div class="col-start-0 col-span-8">
        <h6 class="mb-1">Config(Json)</h6>
        <Textarea v-model="properties" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
      </div>
    </div>

     <div class="col-start-0 col-span-8">
       <Dropdown v-model="studyGroupId" :options="groupStates" option-label="label" option-value="value" :placeholder="getLabelForChoiceValue(studyGroupId, groupStates) || $t('noGroup')">
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
.obervation-dialog {
  .buttons {
    button {
      margin-left: 10px;
    }
  }

  .error {
    color: #D57575;

  }
}

</style>

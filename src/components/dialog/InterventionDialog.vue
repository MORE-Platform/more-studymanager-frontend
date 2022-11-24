<script setup lang="ts">
  import {inject, ref, Ref} from 'vue';
  import InputText from 'primevue/inputtext'
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import SplitButton from 'primevue/splitbutton';
  import Dropdown from 'primevue/dropdown';
  import {Action, Trigger, Intervention} from '../../generated-sources/openapi';


  const dialogRef:any = inject("dialogRef")
  const intervention:Intervention = dialogRef.value.data?.intervention || {};
  const actionsData:Action[] = dialogRef.value.data?.actionsData;
  const triggerData:Trigger = dialogRef.value.data?.triggerData;
  const groupStates = dialogRef.value.data?.groupStates || undefined;
  const groupPlaceholder = dialogRef.value.data?.groupPlaceholder || 'Choose a group';
  const actionTypes = dialogRef.value.data?.actionTypes;
  const actionTypesOptions: Ref<any[]> = ref([])
  const triggerTypesOptions = dialogRef.value.data?.triggerTypes;

  console.log(intervention);
  console.log(intervention.interventionId)
  console.log("intervention dialog")

  const title = ref(intervention.title);
  const purpose = ref(intervention.purpose);
  const triggerProp = ref(triggerData ? JSON.stringify(triggerData.properties) : '{}');
  const triggerType = ref(triggerData ? triggerData.type : undefined);
  const triggerDescription = ref(triggerData ? triggerTypesOptions.find((t:any) => t.value === triggerData.type)?.description : 'Choose a trigger type')
  const actionsArray: Ref<any[]> = ref(actionsData || []);
  const studyGroupId = ref(intervention.studyGroupId)
  const jsonError: Ref<string> = ref('')
  const actionsEmptyError: Ref<string> = ref('')
  const triggerEmptyError: Ref<string> = ref('')

  if(actionsArray.value.length) {
    actionsArray.value = actionsArray.value.map((item) => ({actionId: item.actionId, type: item.type, properties: JSON.stringify(item.properties)}))
  }

  if(actionTypes.length) {
    actionTypesOptions.value = actionTypes.map((item: any) => (
      {
        label: item.label,
        value: item.value,
        command: () => {
          actionsArray.value.push({type: item.value, properties: JSON.stringify({})})
        }
      }))
  }

  function save(){
    try {
      const triggerProps = {type: triggerType.value, properties: JSON.parse(triggerProp.value.toString())}
      const actionsProps = actionsArray.value.map((item) => ({type: item.type, properties: JSON.parse(item.properties)}));

    const returnIntervention = {
      interventionId: intervention.interventionId,
      title: title.value,
      purpose: purpose.value,
      trigger: {},
      actions: [],
      studyGroupId: studyGroupId.value,
      scheduler: intervention.schedule
    } as Intervention;

      const returnObject = {
        intervention: returnIntervention,
        trigger: triggerProps,
        actions: actionsProps
      }

      if(triggerProps.type && triggerProps.properties.cronSchedule && triggerProps.properties.query && triggerProps.properties.window && actionsProps.length) {
        jsonError.value = '';
        triggerEmptyError.value = '';
        actionsEmptyError.value = '';
        dialogRef.value.close(returnObject);
      } else {
        if (triggerProps.type || !triggerProps.properties.query || !triggerProps.properties.window  || !triggerProps.properties.cronSchedule) {
          triggerEmptyError.value = 'Please choose trigger type and enter trigger config {"query":"q","window":100,"cronSchedule":"abc"}.'
        } else {
          triggerEmptyError.value = '';
        }
        if (!actionsProps.length) {
          actionsEmptyError.value = 'Please choose at least one action and enter action config {"message": "m"}.'
        } else {
          actionsEmptyError.value = '';
        }
      }
    } catch(e) {
      console.error(e);
      jsonError.value = 'Please enter valid json inside the Config(Json) fields.'
    }
  }
  function cancel() {
    dialogRef.value.close();
  }

  function deleteAction(index: number) {
    actionsArray.value.splice(index, 1);
  }

  function nameForActionType(actionType?: string) {
    return actionTypes.find((a:any) => a.value === actionType)?.label || actionType;
  }
  function getTriggerDescription(tType?: string) {
    triggerDescription.value = triggerTypesOptions.find((t:any) => t.value === tType)?.description || 'Choose a trigger type';
  }
  function getActionDescription(actionType?: string) {
    return actionTypes.find((a:any) => a.value === actionType)?.description || 'No description available';
  }
</script>


<template>
  <div class="intervention-dialog">
    <div class="grid grid-cols-8 gap-4 items-center">
      <div class="col-start-0 col-span-2"><h5>{{ $t('intervention') }} {{ $t('title') }}</h5></div>
      <div class="col-start-3 col-span-6">
        <InputText v-model="title" placeholder="Enter intervention title." style="width: 100%"></InputText>
      </div>

      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('purpose') }}</h5>
        <Textarea v-model="purpose" placeholder="Enter the main purpose and intention of the study." :auto-resize="true" style="width: 100%"></Textarea>
      </div>

      <div v-if="jsonError" class="col-span-8 error mb-4">{{jsonError}}</div>
      <div class="col-start-0 col-span-8 grid grid-cols-2 lg:grid-cols-3">
        <h5 class="mb-2 lg:col-span-2">{{$t('trigger')}}</h5>
        <Dropdown v-model="triggerType" :options="triggerTypesOptions" class="col-span-1" option-label="label" option-value="value" :placeholder="$t('placeholder.trigger')" @change="getTriggerDescription(triggerType)"/>
        <div v-if="triggerEmptyError" class="error col-start-0 col-span-8 lg:col-span-3">{{triggerEmptyError}}</div>
        <div class="col-start-0 col-span-3">
          <h6 class="mb-1">Config(Json)</h6>
          <div class="mb-4" v-html="triggerDescription"></div>
          <Textarea v-model="triggerProp" placeholder="Enter the config for the trigger" :auto-resize="true" style="width: 100%"></Textarea>
        </div>
      </div>

     <div class="col-start-0 col-span-8 grid grid-cols-9">
       <div class="col-span-9 grid grid-cols-2 lg:grid-cols-3">
        <h5 class="mb-2 lg:col-span-2">{{$t('action')}}</h5>
        <SplitButton class="splitButton w-full lg:cols-pan-1" type="button" :label="'New Action'" :icon="'pi pi-plus'" :model='actionTypesOptions' ></SplitButton>
       </div>
       <div v-if="actionsEmptyError" class="col-span-8 error"> {{actionsEmptyError}}</div>
        <div v-if="actionsArray.length" class="col-span-9">
          <div v-for="(action, index) in actionsArray" :key="index" class="col-start-0 col-span-9 js-action mb-4" >
            <div class="mb-3  mt-4">
              <h6 class="mb-1 col-span-2 inline">Config(Json): </h6>
              <div class="col-span-3 inline font-medium">{{nameForActionType(action.type)}}</div>
            </div>
            <div v-html="getActionDescription(action.type)" class="mb-4"> </div>
            <div class="col-span-4 justify-end"></div>
            <Textarea v-model="actionsArray[index].properties" class="col-span-9" placeholder="Enter the config for the action" :auto-resize="true" style="width: 100%" />
            <div class="buttons justify-end mt-2 col-span-9">
               <Button :icon="'pi pi-trash'" @click="deleteAction(index)"/>
            </div>
          </div>
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
.intervention-dialog {
  .buttons {
    button {
      margin-left: 10px;
    }
  }
  .splitButton {
    background-color: var(--primary-color);
    color: white;
    padding: 0 6px;
    justify-content: center;
    align-items: center;
  }
  .error {
    color: #D57575;
  }
}

</style>

<script setup lang="ts">
  import {inject, ref, Ref} from 'vue';
  import InputText from 'primevue/inputtext'
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import SplitButton from 'primevue/splitbutton';
  import Dropdown from 'primevue/dropdown';
  import {Intervention, Observation} from '../../generated-sources/openapi';
  import {Action} from '../../generated-sources/openapi';

  const dialogRef:any = inject("dialogRef")
  const intervention:Intervention = dialogRef.value.data?.intervention || {};
  const groupStates = dialogRef.value.data?.groupStates || undefined;
  const groupPlaceholder = dialogRef.value.data?.groupPlaceholder || 'Choos a group';

  const title = ref(intervention.title);
  const purpose = ref(intervention.purpose);
  const trigger = ref(intervention.trigger);
  const actions: Ref<Action[]> = ref(intervention.actions || [{
    type: "acc-mobile-observation",
    properties: {}
  }]);
  const actionsString: Ref<Action[]> = ref(actionsStringify(actions.value))
  const studyGroupId = ref(intervention.studyGroupId)

  const actionItems = [
    {
      label: "Accelerometer Mobile",
      value: "acc-mobile-observation",
      command: () => {
        actions.value.push({type: 'acc-mobile-observation', properties: {}})
      }
    }
  ]

  function save(){
    const returnObservation = {
      title: title.value,
      purpose: purpose.value,
      trigger: trigger.value,
      actions: actions.value,
      studyGroupId: studyGroupId.value,
      scheduler: intervention.schedule
    } as Observation;

    dialogRef.value.close(returnObservation);
  }
  function cancel() {
    dialogRef.value.close();
  }

  function addNewAction(e: any) {
    console.log(e);
    //actions.value.push({type: 'acc-mobile-observation', properties: {}})
  }
  function deleteAction(index: number) {
    console.log(index);
    actions.value.splice(index, 1);
  }

  function actionsStringify(actions: Array<any[]>) {
    if (actions) {
      return actions.map((item: any) => (JSON.stringify(item)))
    }
    /*if(actions.value) {
      actions.value.forEach((item) => {
        a.value.push(JSON.stringify(item))
      })
    }*/


  }

  console.log("actionString");
  console.log(actionsString.value)


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

      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{$t('trigger')}}</h5>
        <div class="col-start-0 col-span-8">
          <h6 class="mb-1">Config(Json)</h6>
          <Textarea v-model="trigger" placeholder="Enter the config for the trigger" :auto-resize="true" style="width: 100%"></Textarea>
        </div>
      </div>

      <div class="col-start-0 col-span-8 grid grid-cols-9">
        <h5 class="mb-2 col-span-7">{{$t('action')}}</h5>
        <SplitButton :key="actions.length" class="splitButton w-full col-span-2" type="button" :label="'New Action'" :icon="'pi pi-plus'" :model='actionItems' @click="addNewAction($event)" ></SplitButton>
        <div v-for="(action, index) in actions" :key="index" class="col-start-0 col-span-9 js-action grid mb-4" >
          <div class="mb-3">
            <h6 class="mb-1 col-span-2 inline">Config(Json): </h6>
            <div class="col-span-3 inline font-medium">{{action.type}}</div>
          </div>
          <div class="col-span-4 justify-end"></div>
          <Textarea v-model="actions[index].properties" class="col-span-9" placeholder="Enter the config for the action" :auto-resize="true" style="width: 100%" />
          <div class="buttons justify-end mt-2 col-span-9">
             <Button :icon="'pi pi-trash'" @click="deleteAction(index)"/>
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
}

</style>

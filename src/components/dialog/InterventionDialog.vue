<script setup lang="ts">
  import {inject, ref, Ref} from 'vue';
  import InputText from 'primevue/inputtext'
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import SplitButton from 'primevue/splitbutton';
  import Dropdown from 'primevue/dropdown';
  import {useComponentsApi} from '../../composable/useApi';
  import {Action, Trigger, Intervention, ComponentFactory, ValidationReport} from '../../generated-sources/openapi';

  const { componentsApi } = useComponentsApi();

  const dialogRef:any = inject("dialogRef")
  const intervention:Intervention = dialogRef.value.data?.intervention || {};
  const actionsData:Action[] = dialogRef.value.data?.actionsData;
  const triggerData:Trigger = dialogRef.value.data?.triggerData;
  const groupStates = dialogRef.value.data?.groupStates || undefined;
  const groupPlaceholder = dialogRef.value.data?.groupPlaceholder || 'Entire Study';
  const actionFactories = dialogRef.value.data?.actionFactories;
  const triggerFactories = dialogRef.value.data?.triggerFactories;

  const triggerTypesOptions = triggerFactories.map((item:any) => ({label: item.title, value: item.componentId, description: item.description}))

  const title = ref(intervention.title);
  const purpose = ref(intervention.purpose);
  const triggerProp = ref(triggerData ? JSON.stringify(triggerData.properties) : '{}');
  const triggerType = ref(triggerData ? triggerData.type : undefined);
  const triggerDescription = ref()
  setTriggerDescription(triggerData?.type)
  const actionsArray: Ref<any[]> = ref(actionsData || []);
  const studyGroupId = ref(intervention.studyGroupId)
  const triggerJsonError:Ref<string|undefined> = ref()
  const actionJsonError:Ref<string[]> = ref([])
  const actionsEmptyError: Ref<string> = ref('')
  const triggerEmptyError: Ref<string> = ref('')
  const removeActions: Ref<number[]> = ref([])

  if(actionsArray.value.length) {
    actionsArray.value = actionsArray.value.map((item) => ({actionId: item.actionId, type: item.type, properties: JSON.stringify(item.properties)}))
  }

  const actionTypesOptions = ref(actionFactories.map((item: ComponentFactory) => (
    {
      label: item.title,
      value: item.componentId,
      command: () => {
        actionsArray.value.push({type: item.componentId, properties: JSON.stringify(item.defaultProperties)})
      }
    })));

  function validate(component:any, componentType:string, props:any, i?: number) {
    return new Promise((resolve, reject) => {
      let parsedProps:any;
      try {
        parsedProps = JSON.parse(props.toString());
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        componentsApi.validateProperties(component, componentType, parsedProps)
          .then((response:any) => response.data)
          .then((report:ValidationReport) => {
            if(report.valid) {
              resolve(parsedProps);
            } else {
              const error = report.errors?.concat(report.warnings || []).map(e => e.message).join(", ");
              reject({msg: error, component, i});
            }
          });
      } catch (e) {
        reject({msg: "Cannot parse properties, no valid json", component, i});
      }
    })
  }

  function save() {
    Promise.all([
      ...actionsArray.value.map((item, id) => ({component: 'action', type: item.type, properties: item.properties, id})),
      {component: 'trigger', type: triggerType.value, properties: triggerProp.value, id:-1}
    ].map(v => validate(v.component, v.type, v.properties, v.id))).then(() => {
      const triggerProps = {type: triggerType.value, properties: JSON.parse(triggerProp.value.toString())}
      const actionsProps = actionsArray.value.map((item) => ({
        actionId: item?.actionId,
        type: item.type,
        properties: JSON.parse(item.properties)
      }));

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
        actions: actionsProps,
        removeActions: removeActions.value
      }
      dialogRef.value.close(returnObject);
    }).catch(reason => {
      if(reason.component === 'trigger') {
        triggerJsonError.value = reason.msg
      } else {
        const actionErrors = []
        actionErrors[reason.i] = reason.msg;
        actionJsonError.value =  actionErrors;
        console.log(actionErrors);
      }
    })
  }

  function cancel() {
    dialogRef.value.close();
  }

  function deleteAction(actionId: number, index: number) {
    removeActions.value.push(actionId);
    actionsArray.value.splice(index, 1);
  }

  function nameForActionType(actionType?: string) {
    return actionFactories.find((a:ComponentFactory) => a.componentId === actionType)?.label;
  }
  function setTriggerDescription(tType?: string) {
    triggerDescription.value = triggerFactories.find((t:ComponentFactory) => t.componentId === tType)?.description || 'Choose a trigger type';
    triggerProp.value = JSON.stringify(triggerFactories.find((t:ComponentFactory) => t.componentId === tType)?.defaultProperties)
  }
  function getActionDescription(actionType?: string) {
    return actionFactories.find((a:ComponentFactory) => a.componentId === actionType)?.description || 'No description available';
  }
</script>


<template>
  <div class="intervention-dialog">
    <div class="grid grid-cols-8 gap-4 items-center">
      <div class="col-start-0 col-span-2"><h5>{{ $t('intervention') }} {{ $t('title') }}</h5></div>
      <div class="col-start-3 col-span-6">
        <InputText v-model="title" :placeholder="$t('placeholder.title')" style="width: 100%"></InputText>
      </div>

      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('purpose') }}</h5>
        <Textarea v-model="purpose" :placeholder="$t('placeholder.purpose')" :auto-resize="true" style="width: 100%"></Textarea>
      </div>

      <div class="col-start-0 col-span-8 grid grid-cols-2 lg:grid-cols-3">
        <h5 class="mb-2 lg:col-span-2">{{$t('trigger')}}</h5>
        <Dropdown v-model="triggerType" :options="triggerTypesOptions" class="col-span-1" option-label="label" option-value="value" :placeholder="$t('placeholder.trigger')" @change="setTriggerDescription(triggerType)"/>
        <div v-if="triggerEmptyError" class="error col-start-0 col-span-8 lg:col-span-3">{{triggerEmptyError}}</div>
        <div class="col-start-0 col-span-3">
          <!-- eslint-disable vue/no-v-html -->
          <div class="mb-4" v-html="triggerDescription"></div>
          <div v-if="triggerJsonError" class="mb-4 error">{{triggerJsonError}}</div>
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
              <div class="col-span-3 inline font-medium">{{nameForActionType(action.type)}}</div>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div class="mb-4" v-html="getActionDescription(action.type)"> </div>
            <div class="col-span-4 justify-end"></div>
            <div v-if="actionJsonError[index]" class="mb-4 error">{{actionJsonError[index]}}</div>
            <Textarea v-model="actionsArray[index].properties" class="col-span-9" placeholder="Enter the config for the action" :auto-resize="true" style="width: 100%" />
            <div class="buttons justify-end mt-2 col-span-9">
               <Button :icon="'pi pi-trash'" @click="deleteAction(actionsArray[index].actionId, index)"/>
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

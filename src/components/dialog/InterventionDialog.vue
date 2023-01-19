<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import Menu from 'primevue/menu';
  import Dropdown from 'primevue/dropdown';
  import { useComponentsApi } from '../../composable/useApi';
  import {
    Action,
    Trigger,
    Intervention,
    ComponentFactory,
    ValidationReport,
  } from '../../generated-sources/openapi';
  import CronSchedulerConfiguration from '../forms/CronSchedulerConfiguration.vue';

  const { componentsApi } = useComponentsApi();

  const dialogRef: any = inject('dialogRef');
  const intervention: Intervention = dialogRef.value.data?.intervention || {};
  const actionsData: Action[] = dialogRef.value.data?.actionsData;
  const triggerData: Trigger = dialogRef.value.data?.triggerData;
  const groupStates = dialogRef.value.data?.groupStates || undefined;
  const groupPlaceholder =
    dialogRef.value.data?.groupPlaceholder || 'Entire Study';
  const actionFactories = dialogRef.value.data?.actionFactories;
  const triggerFactories = dialogRef.value.data?.triggerFactories;

  const triggerTypesOptions = triggerFactories.map((item: any) => ({
    label: item.title,
    value: item.componentId,
    description: item.description,
  }));

  const title = ref(intervention.title);
  const purpose = ref(intervention.purpose);
  const triggerProp = ref(
    triggerData ? JSON.stringify(triggerData.properties) : undefined
  );
  const triggerType = ref(triggerData ? triggerData.type : undefined);
  const showScheduleInput = ref(false);
  const hasAdditionalTriggerConfig: Ref<boolean> = ref(false);
  const nonScheduleInput: Ref<string> = ref(
    triggerProp?.value ? triggerProp.value : ''
  );
  const prevTriggerType: Ref<string | undefined> = ref(triggerData?.type);
  setTriggerConfig(triggerData?.type ? triggerData.type : '');
  setNonScheduleTriggerConfig(triggerData?.properties);
  const actionsArray: Ref<any[]> = ref(actionsData || []);
  const studyGroupId = ref(intervention.studyGroupId);
  const triggerJsonError: Ref<string | undefined> = ref();
  const actionJsonError: Ref<string[]> = ref([]);
  const actionsEmptyError: Ref<string> = ref('');
  const triggerEmptyError: Ref<string> = ref('');
  const removeActions: Ref<number[]> = ref([]);

  if (actionsArray.value.length) {
    actionsArray.value = actionsArray.value.map((item) => ({
      actionId: item.actionId,
      type: item.type,
      properties: JSON.stringify(item.properties),
    }));
  }

  const actionTypesOptions = ref(
    actionFactories.map((item: ComponentFactory) => ({
      label: item.title,
      value: item.componentId,
      command: () => {
        actionsArray.value.push({
          type: item.componentId,
          properties: JSON.stringify(item.defaultProperties),
        });
      },
    }))
  );

  function validate(
    component: any,
    componentType: string,
    props: any,
    i?: number
  ) {
    return new Promise((resolve, reject) => {
      let parsedProps: any;
      try {
        parsedProps = JSON.parse(props.toString());
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        componentsApi
          .validateProperties(component, componentType, parsedProps)
          .then((response: any) => response.data)
          .then((report: ValidationReport) => {
            if (report.valid) {
              resolve(parsedProps);
            } else {
              const error = report.errors
                ?.concat(report.warnings || [])
                .map((e) => e.message)
                .join(', ');
              reject({ msg: error, component, i });
            }
          });
      } catch (e) {
        reject({ msg: 'Cannot parse properties, no valid json', component, i });
      }
    });
  }

  function save() {
    if (externalErrors.value.length === 0)
      Promise.all(
        [
          ...actionsArray.value.map((item, id) => ({
            component: 'action',
            type: item.type,
            properties: item.properties,
            id,
          })),
          {
            component: 'trigger',
            type: triggerType.value,
            properties: triggerProp.value,
            id: -1,
          },
        ].map((v) => validate(v.component, v.type, v.properties, v.id))
      )
        .then(() => {
          updateProps();
          const triggerProps = {
            type: triggerType.value,
            properties: triggerProp.value
              ? JSON.parse(triggerProp.value.toString())
              : '{}',
          };

          const actionsProps = actionsArray.value.map((item) => ({
            actionId: item?.actionId,
            type: item.type,
            properties: JSON.parse(item.properties),
          }));

          const returnIntervention = {
            interventionId: intervention.interventionId,
            title: title.value,
            purpose: purpose.value,
            trigger: {},
            actions: [],
            studyGroupId: studyGroupId.value,
            scheduler: intervention.schedule,
          } as Intervention;

          const returnObject = {
            intervention: returnIntervention,
            trigger: triggerProps,
            actions: actionsProps,
            removeActions: removeActions.value,
          };
          actionJsonError.value = [];
          triggerEmptyError.value = '';
          triggerJsonError.value = '';

          if (actionsArray.value.length) {
            dialogRef.value.close(returnObject);
          }
        })
        .catch((reason) => {
          if (reason.component === 'trigger') {
            triggerJsonError.value = reason.msg;
          } else {
            const actionErrors = [];
            actionErrors[reason.i] = reason.msg;
            actionJsonError.value = actionErrors;
          }
        });
  }

  const errors: Ref<Array<any>> = ref([]);
  const externalErrors: Ref<Array<any>> = ref([]);

  function checkErrors() {
    if (!title.value) {
      errors.value.push('Intervention Title');
    }
    if (!triggerProp.value) {
      errors.value.push('Trigger Type and Config');
    }
    if (!actionsArray.value.length) {
      errors.value.push('At least 1 Action');
    }
  }

  function checkExternalErrors(e?: string) {
    externalErrors.value = [];
    if (e) externalErrors.value.push(e);
  }

  function cancel() {
    dialogRef.value.close();
  }

  function deleteAction(actionId: number, index: number) {
    removeActions.value.push(actionId);
    actionsArray.value.splice(index, 1);
  }

  function nameForActionType(actionType?: string) {
    return actionFactories.find(
      (a: ComponentFactory) => a.componentId === actionType
    )?.label;
  }
  function setTriggerConfig(tType: string) {
    let props;
    const trigger = triggerFactories.find(
      (t: ComponentFactory) => t.componentId === tType
    );
    if (!prevTriggerType.value || prevTriggerType.value !== tType) {
      triggerProp.value = JSON.stringify(trigger?.defaultProperties);
      props = trigger?.defaultProperties;
    }
    if (triggerData && tType === triggerData?.type) {
      triggerProp.value = JSON.stringify(triggerData?.properties);
      props = triggerData?.properties;
    }
    setNonScheduleTriggerConfig(props);

    prevTriggerType.value = tType;
  }

  function setNonScheduleTriggerConfig(triggerProperties?: object) {
    nonScheduleInput.value = JSON.stringify(triggerProperties, (key, value) => {
      if (key === 'cronSchedule') {
        showScheduleInput.value = true;
        return undefined;
      } else {
        return value;
      }
    });
    hasAdditionalTriggerConfig.value = nonScheduleInput.value !== '{}';
  }

  function getActionDescription(actionType?: string) {
    return (
      actionFactories.find(
        (a: ComponentFactory) => a.componentId === actionType
      )?.description || 'No description available'
    );
  }

  const actionMenu = ref();
  function actionToggle(event: PointerEvent) {
    actionMenu.value.toggle(event);
  }

  function setCronSchedule(e: string) {
    triggerProp.value = e;
    checkExternalErrors();
  }

  function updateProps() {
    if (triggerProp.value) {
      const nonScheduleTriggerPropJson = JSON.parse(nonScheduleInput.value);
      const triggerPropJson = JSON.parse(triggerProp.value);
      nonScheduleTriggerPropJson.cronSchedule = triggerPropJson.cronSchedule;
      triggerProp.value = JSON.stringify(nonScheduleTriggerPropJson);
    }
  }
</script>

<template>
  <div class="intervention-dialog">
    <div class="mb-4">
      <h5>{{ $t('dialogDescription.interventionsDialogTitle') }}</h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6 v-html="$t('dialogDescription.interventionDialog')"></h6>
    </div>
    <form
      id="interventionDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      @submit.prevent="save()"
    >
      <div v-if="errors.length" class="error col-span-8">
        <span class="font-medium">
          Please fill out following information:
        </span>
        <div>
          <span v-for="(error, index) in errors" :key="index">
            {{ error }}
            <span v-if="index < errors.length - 1" class="mr-0.5 inline"
              >,
            </span>
          </span>
        </div>
      </div>
      <div class="col-start-0 col-span-2">
        <h5>{{ $t('intervention') }} {{ $t('title') }}</h5>
      </div>
      <div class="col-span-6 col-start-3">
        <InputText
          v-model="title"
          type="text"
          required
          :placeholder="$t('placeholder.title')"
          style="width: 100%"
        ></InputText>
      </div>

      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('purpose') }}</h5>
        <Textarea
          v-model="purpose"
          :placeholder="$t('placeholder.purpose')"
          :auto-resize="true"
          style="width: 100%"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-8 grid grid-cols-2 lg:grid-cols-3">
        <h5 class="mb-2 lg:col-span-2">{{ $t('trigger') }}</h5>
        <Dropdown
          v-model="triggerType"
          :options="triggerTypesOptions"
          class="col-span-1 mb-4"
          option-label="label"
          option-value="value"
          required
          :placeholder="$t('placeholder.trigger')"
          @change="setTriggerConfig(triggerType)"
        />
        <div
          v-if="triggerEmptyError"
          class="error col-start-0 col-span-8 lg:col-span-3"
        >
          {{ triggerEmptyError }}
        </div>
        <div class="col-start-0 col-span-3">
          <!-- eslint-disable vue/no-v-html -->
          <div v-if="triggerJsonError" class="error mb-4">
            {{ triggerJsonError }}
          </div>
          <CronSchedulerConfiguration
            v-show="showScheduleInput"
            v-if="showScheduleInput"
            v-model="triggerProp"
            class="mb-4"
            :trigger-props="triggerProp"
            @on-valid-schedule="setCronSchedule($event)"
            @on-error="checkExternalErrors($event)"
          ></CronSchedulerConfiguration>
          <Textarea
            v-show="hasAdditionalTriggerConfig"
            v-model="nonScheduleInput"
            required
            placeholder="Enter the config for the trigger"
            :auto-resize="true"
            style="width: 100%"
          ></Textarea>
        </div>
      </div>

      <div class="col-start-0 col-span-8 grid grid-cols-9">
        <div class="col-span-9 grid grid-cols-2 lg:grid-cols-3">
          <h5 class="mb-2 lg:col-span-2">{{ $t('action') }}</h5>
          <Button
            class="splitButton disable-left lg:cols-pan-1 w-full"
            type="button"
            :label="'New Action'"
            :icon="'pi pi-plus'"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            @click="actionToggle"
          ></Button>
          <Menu ref="actionMenu" :model="actionTypesOptions" :popup="true">
          </Menu>
        </div>
        <div v-if="actionsEmptyError" class="error col-span-8">
          {{ actionsEmptyError }}
        </div>
        <div v-if="actionsArray.length" class="col-span-9">
          <div
            v-for="(action, index) in actionsArray"
            :key="index"
            class="col-start-0 js-action col-span-9 mb-4"
          >
            <div class="mb-3 mt-4">
              <div class="col-span-3 inline font-medium">
                {{ nameForActionType(action.type) }}
              </div>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <div class="mb-4" v-html="getActionDescription(action.type)"></div>
            <div class="col-span-4 justify-end"></div>
            <div v-if="actionJsonError[index]" class="error mb-4">
              {{ actionJsonError[index] }}
            </div>
            <Textarea
              v-model="actionsArray[index].properties"
              class="col-span-9"
              placeholder="Enter the config for the action"
              required
              :auto-resize="true"
              style="width: 100%"
            />
            <div class="buttons col-span-9 mt-2 justify-end">
              <Button
                :icon="'pi pi-trash'"
                @click="deleteAction(actionsArray[index].actionId, index)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="col-start-0 col-span-8">
        <Dropdown
          v-model="studyGroupId"
          :options="groupStates"
          option-label="label"
          option-value="value"
          :placeholder="$t(groupPlaceholder)"
        >
          <template #option="optionProps">
            <div class="p-dropdown-car-option">
              <span>{{ optionProps.option.label }}</span>
            </div>
          </template>
        </Dropdown>
      </div>

      <div class="col-start-0 buttons col-span-8 mt-8 justify-end text-right">
        <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
        <Button type="submit" @click="checkErrors()">Save</Button>
      </div>
    </form>
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
      padding: 0 20px;
      justify-content: center;
      align-items: center;

      &.disable-left {
        .p-splitbutton-defaultbutton {
          pointer-events: none;
        }
      }
    }
    .error {
      color: #d57575;
    }
  }
</style>

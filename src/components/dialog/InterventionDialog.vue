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
    StudyStatus,
  } from '../../generated-sources/openapi';
  import CronSchedulerConfiguration from '../forms/CronSchedulerConfiguration.vue';
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import InterventionTriggerConditions from '../forms/InterventionTriggerConditions.vue';
  import { TriggerConditionGroup } from '../../models/InterventionTriggerModel';
  import InputNumber from 'primevue/inputnumber';
  import PushNotificationInput from './shared/PushNotificationInput.vue';
  import { Property } from '../../models/InputModels';

  const { componentsApi } = useComponentsApi();
  const studyStore = useStudyStore();
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const intervention: Intervention = dialogRef.value.data?.intervention || {};
  const actionsData: Action[] = dialogRef.value.data?.actionsData;
  const triggerData: Trigger = dialogRef.value.data?.triggerData;
  const groupStates = dialogRef.value.data?.groupStates || undefined;
  const groupPlaceholder =
    dialogRef.value.data?.groupPlaceholder || 'Entire Study';
  const actionFactories = dialogRef.value.data?.actionFactories;
  const triggerFactories = dialogRef.value.data?.triggerFactories;

  function getProperties(): Property<any>[] | undefined {
    if (
      typeof triggerData !== 'undefined' &&
      typeof triggerData.properties !== 'undefined'
    ) {
      const triggerTypeProps = triggerFactories.find(
        (item: any) => item.componentId === triggerData.type
      ).properties;
      const properties: Property<any>[] = triggerTypeProps
        .map((json: any) => Property.fromJson(json))
        .map((p: Property<any>) => p.setValue(triggerData.properties?.[p.id]));

      return properties;
    }
  }

  const triggerProperties: Property<any>[] | undefined = getProperties();

  const triggerTypesOptions = triggerFactories.map((item: any) => ({
    label: t(item.title),
    value: item.componentId,
    description: t(item.description),
  }));

  function getTriggerTypeDescription(triggerType: string): string {
    const trigger = triggerTypesOptions.find(
      (item: any) => item.value === triggerType
    );
    return trigger.description;
  }

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
  const cronScheduleProp: Ref<string> = triggerProp.value
    ? JSON.parse(triggerProp.value).cronSchedule
    : '0 0 12 * * ?';

  const actionsArray: Ref<any[]> = ref(actionsData || []);
  const studyGroupId = ref(intervention.studyGroupId);
  const triggerJsonError: Ref<string | undefined> = ref();
  const actionJsonError: Ref<string[]> = ref([]);
  const actionsEmptyError: Ref<string> = ref('');
  const removeActions: Ref<number[]> = ref([]);
  const triggerConfigQueryObj: Ref<Array<any>> = ref([]);
  const triggerConfigWindow: Ref<number | undefined> = ref(undefined);
  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused;

  setTriggerConfig(triggerData?.type ? triggerData.type : '');
  setNonScheduleTriggerConfig(triggerData?.properties);

  const triggerConditionsError: Ref<string | undefined> = ref(undefined);
  const interventionRowIsOpen: Ref<boolean> = ref(false);

  function setRowOpenError(isOpen: boolean) {
    interventionRowIsOpen.value = isOpen;
    checkErrors();
  }

  if (actionsArray.value.length) {
    actionsArray.value = actionsArray.value.map((item) => ({
      actionId: item.actionId,
      type: item.type,
      properties: JSON.stringify(item.properties),
    }));
  }

  const actionTypesOptions = ref(
    actionFactories.map((item: ComponentFactory) => ({
      label: item.title ? t(item.title) : '',
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
        if (
          typeof triggerProperties !== 'undefined' &&
          triggerProperties.length > 0 &&
          componentType === 'trigger'
        ) {
          parsedProps = Property.toJson(triggerProperties);
        } else {
          parsedProps = JSON.parse(props.toString());
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        componentsApi
          .validateProperties(component, componentType, parsedProps)
          .then((response: any) => response.data)
          .then((report: ValidationReport) => {
            if (report.valid) {
              resolve(parsedProps);
            } else {
              console.error('validation rejected');
              console.error(report.errors);
              const error = report.errors
                ?.concat(report.warnings || [])
                .map((e) => e.message)
                .join(', ');
              reject({ msg: error, component, i });
            }
          });
      } catch (e) {
        console.error('validation request error');
        console.error(e);
        reject({ msg: 'Cannot parse properties, no valid json', component, i });
      }
    });
  }

  function save() {
    if (externalErrors.value.length === 0 && errors.value.length === 0) {
      updateProps();
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
            schedule: intervention.schedule,
          } as Intervention;

          const returnObject = {
            intervention: returnIntervention,
            trigger: triggerProps,
            actions: actionsProps,
            removeActions: removeActions.value,
          };

          actionJsonError.value = [];
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
  }

  const errors: Ref<Array<MoreTableChoice>> = ref([]);
  const externalErrors: Ref<Array<any>> = ref([]);

  function checkErrors() {
    errors.value = [];
    if (!title.value) {
      errors.value.push({
        label: 'title',
        value: t('intervention.error.addTitle'),
      });
    }
    if (!triggerProp.value) {
      errors.value.push({
        label: 'trigger',
        value: t('intervention.error.addTriggerTypeConfig'),
      });
    }
    if (!actionsArray.value.length) {
      errors.value.push({
        label: 'action',
        value: t('intervention.error.addAction'),
      });
    }
    if (
      triggerType.value === 'scheduled-datacheck-trigger' &&
      triggerConfigQueryObj.value.length === 0
    ) {
      errors.value.push({
        label: 'triggerConfig',
        value: t('intervention.error.addTriggerConfig'),
      });
    }
    if (interventionRowIsOpen.value) {
      errors.value.push({
        label: 'interventionRowIsOpen',
        value: t('intervention.error.interventionRowIsOpen'),
      });
    }
  }

  function setTriggerConditionError(triggerTableE?: string) {
    triggerConditionsError.value = triggerTableE;
    checkErrors();
  }

  function getError(label: string): string | null | undefined {
    const item = errors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
  }

  function checkExternalErrors(e?: string) {
    externalErrors.value = [];
    if (e) {
      externalErrors.value.push(e);
    }
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
  function setTriggerConfig(tType: string | undefined) {
    let props: object | undefined;
    if (tType) {
      const trigger = triggerFactories.find(
        (t: ComponentFactory) => t.componentId === tType
      );
      if (!prevTriggerType.value || prevTriggerType.value !== tType) {
        props = trigger?.defaultProperties;
        if (!triggerData) {
          triggerProp.value = JSON.stringify(props);
        }
      } else if (triggerData && tType === triggerData?.type) {
        props = triggerData?.properties;
      }
      setNonScheduleTriggerConfig(props);
      prevTriggerType.value = tType;
    }
  }

  function setNonScheduleTriggerConfig(triggerProperties?: object) {
    nonScheduleInput.value = JSON.stringify(triggerProperties, (key, value) => {
      if (key === 'cronSchedule') {
        showScheduleInput.value = true;
        return undefined;
      } else if (key === 'queryObject') {
        triggerConfigQueryObj.value = value ? value : [];
        return undefined;
      } else if (key === 'window') {
        triggerConfigWindow.value = value ? value : undefined;
        return value;
      } else {
        return value;
      }
    });
    triggerProp.value = JSON.stringify(triggerProperties);

    hasAdditionalTriggerConfig.value =
      triggerProp.value !== undefined && nonScheduleInput.value !== '{}';
  }

  function getActionDescription(actionType?: string) {
    return (
      actionFactories.find(
        (a: ComponentFactory) => a.componentId === actionType
      )?.description || t('intervention.placeholder.noDescription')
    );
  }

  const actionMenu = ref();
  function actionToggle(event: MouseEvent) {
    actionMenu.value.toggle(event);
  }

  function setCronSchedule(e: string) {
    if (triggerProp.value) {
      const tempTriggerProp = JSON.parse(triggerProp.value);
      tempTriggerProp.cronSchedule = e;
      triggerProp.value = JSON.stringify(tempTriggerProp);
      checkExternalErrors();
    }
  }

  function updateProps() {
    if (triggerProp.value) {
      const nonScheduleTriggerPropJson = JSON.parse(nonScheduleInput.value);
      const triggerPropJson = JSON.parse(triggerProp.value);
      nonScheduleTriggerPropJson.cronSchedule = triggerPropJson.cronSchedule;
      // eslint-disable-next-line no-prototype-builtins
      if (JSON.parse(triggerProp.value).hasOwnProperty('window')) {
        nonScheduleTriggerPropJson.window = triggerConfigWindow.value;
      }
      // eslint-disable-next-line no-prototype-builtins
      if (JSON.parse(triggerProp.value).hasOwnProperty('queryObject')) {
        nonScheduleTriggerPropJson.queryObject = triggerConfigQueryObj.value;
      }
      triggerProp.value = JSON.stringify(nonScheduleTriggerPropJson);
    }
  }

  function updateTriggerConditions(triggerConditions: TriggerConditionGroup[]) {
    if (triggerProp.value) {
      const props: Ref<any> = ref(JSON.parse(triggerProp.value as string));
      // eslint-disable-next-line no-prototype-builtins
      if (props.value.hasOwnProperty('queryObject')) {
        props.value.queryObject = triggerConditions;
        setNonScheduleTriggerConfig(props.value);
        triggerProp.value = JSON.stringify(props.value);
      }
    }
  }
</script>

<template>
  <div class="dialog" :class="editable ? '' : 'dialog-disabled'">
    <div class="mb-5" :class="editable ? '' : 'pb-4'">
      <h5 class="mb-1">
        {{ $t('intervention.dialog.title') }}
      </h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6 v-html="$t('intervention.dialog.description')"></h6>
    </div>
    <form
      id="interventionDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      :class="editable ? '' : 'gap-y-2'"
      @submit.prevent="save()"
    >
      <div class="col-start-0 col-span-8 mt-2" :class="editable ? '' : 'pb-4'">
        <h5>{{ $t('intervention.dialog.label.interventionTitle') }}*</h5>
        <div v-if="getError('title')" class="error col-span-8 mb-2">
          {{ getError('title') }}
        </div>
        <InputText
          v-model="title"
          type="text"
          required
          :placeholder="$t('study.placeholder.titleInput')"
          style="width: 100%"
          :disabled="!editable"
        ></InputText>
      </div>

      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('study.props.purpose') }}</h5>
        <Textarea
          v-model="purpose"
          :placeholder="$t('study.placeholder.purposeInput')"
          :auto-resize="true"
          style="width: 100%"
          :disabled="!editable"
        ></Textarea>
      </div>
      <div class="col-start-0 col-span-8 mt-4 grid grid-cols-2 lg:grid-cols-3">
        <h5 class="col-span-2" :class="editable ? 'mb-2' : ''">
          {{ $t('intervention.props.trigger') }}*
        </h5>
        <div class="col-span-3 col-start-3" :class="editable ? '' : 'text-end'">
          <div class="col-span-3">
            <div v-if="!editable" class="inline font-bold">
              <!--{{ $t('intervention.dialog.label.triggerType') }}:  -->
              {{ $t('intervention.dialog.label.triggerType') }}
            </div>
            <Dropdown
              v-model="triggerType"
              :options="triggerTypesOptions"
              class="dropdown-btn col-span-1 w-full"
              option-label="label"
              option-value="value"
              required
              :disabled="!editable"
              :placeholder="$t('intervention.placeholder.trigger')"
              @change="setTriggerConfig(triggerType)"
            />
          </div>
        </div>
        <div
          v-if="triggerType"
          class="col-span-8"
          :class="[
            [editable && !getError('trigger') ? 'mb-5' : 'mb-3'],
            [triggerType ? '' : 'is-empty'],
          ]"
        >
          {{ getTriggerTypeDescription(triggerType) }}
        </div>

        <div v-if="getError('trigger')" class="error col-span-8 mb-4">
          {{ getError('trigger') }}
        </div>
        <div class="col-start-0 col-span-3">
          <!-- eslint-disable vue/no-v-html -->
          <div v-if="triggerJsonError && editable" class="error mb-4">
            {{ triggerJsonError }}
          </div>
          <div
            v-if="
              triggerProp &&
              JSON.parse(triggerProp).hasOwnProperty('window') &&
              JSON.parse(triggerProp).queryObject !== undefined
            "
            class="grid grid-cols-5 items-center gap-2"
          >
            <h6 class="col-span-2 lg:col-span-1">
              {{ $t('intervention.dialog.label.window') }}*
            </h6>
            <InputNumber
              v-model="triggerConfigWindow"
              :placeholder="
                t(
                  'intervention.factory.trigger.scheduledDatacheck.configProps.windowPlaceholder'
                )
              "
              class="col-span-3 lg:col-span-4"
              :disabled="!editable"
            ></InputNumber>
            <div class="col-span-5 mb-4">
              {{
                $t(
                  'intervention.factory.trigger.scheduledDatacheck.configProps.timewindowName'
                )
              }}
            </div>
          </div>
          <CronSchedulerConfiguration
            v-if="showScheduleInput"
            class="mb-4"
            :editable="editable"
            :cron-schedule="cronScheduleProp"
            @on-valid-schedule="setCronSchedule($event)"
            @on-error="checkExternalErrors($event)"
          />

          <div v-if="!editable && hasAdditionalTriggerConfig" class="mb-2">
            {{ $t('cronSchedule.additionalConfig') }}
          </div>
          <Textarea
            v-if="
              hasAdditionalTriggerConfig &&
              triggerProp &&
              JSON.parse(triggerProp).queryObject === undefined
            "
            v-show="hasAdditionalTriggerConfig"
            v-model="nonScheduleInput"
            required
            :disabled="!editable"
            :placeholder="$t('intervention.description.provideTriggerConfig')"
            :auto-resize="true"
            style="width: 100%"
          ></Textarea>
        </div>
        <div
          v-if="
            triggerProp && JSON.parse(triggerProp).hasOwnProperty('queryObject')
          "
          class="col-start-0 col-span-6 mt-5"
        >
          <InterventionTriggerConditions
            :error="getError('triggerConfig') ? getError('triggerConfig') as string : getError('interventionRowIsOpen') as string"
            class="mb-5"
            :trigger-conditions="triggerConfigQueryObj"
            :editable="editable"
            @on-emit-trigger-conditions="updateTriggerConditions($event)"
            @on-error="setTriggerConditionError($event)"
            @on-row-open-error="setRowOpenError($event)"
          />
        </div>
      </div>

      <div class="col-start-0 col-span-8 mt-8 grid grid-cols-9">
        <div class="col-span-9 grid grid-cols-2 lg:grid-cols-3">
          <h5 class="lg:col-span-2" :class="editable ? 'mb-2' : ''">
            {{ $t('intervention.props.action') }}*
          </h5>
          <Button
            v-if="editable"
            class="disable-left lg:cols-pan-1 flex w-full justify-between"
            type="button"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            :disabled="!editable"
            @click="actionToggle"
          >
            <div>
              <span class="pi pi-plus pr-2"></span>{{ $t('global.labels.new') }}
              {{ $t('intervention.props.action') }}
            </div>
            <div class="pi pi-chevron-down"></div
          ></Button>
          <div v-if="getError('action')" class="error col-span-8 mb-4">
            {{ getError('action') }}
          </div>
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
            <div class="col-span-4 justify-end"></div>
            <div v-if="actionJsonError[index] && editable" class="error mb-4">
              {{ actionJsonError[index] }}
            </div>

            <PushNotificationInput
              v-if="actionsArray[index].type === 'push-notification-action'"
              :notification-string="actionsArray[index].properties"
              :description="t(getActionDescription(actionsArray[index].type))"
              :action-type-name="
                nameForActionType(actionsArray[index].type) || ''
              "
              :editable="editable"
              @on-props-change="actionsArray[index].properties = $event"
            />

            <Textarea
              v-else
              v-model="actionsArray[index].properties"
              class="border-disabled col-span-9"
              :placeholder="'intervention.description.provideActionConfig'"
              required
              :disabled="!editable"
              :auto-resize="true"
              style="width: 100%"
            />
            <div class="buttons col-span-9 mt-2 text-end">
              <Button
                v-if="editable"
                :icon="'pi pi-trash'"
                :disabled="!editable"
                @click="deleteAction(actionsArray[index].actionId, index)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="col-start-0 col-span-8">
        <h5 v-if="!editable" class="pb-2 font-bold">
          {{ $t('study.props.studyGroup') }}
        </h5>
        <Dropdown
          v-model="studyGroupId"
          :options="groupStates"
          option-label="label"
          option-value="value"
          :disabled="!editable"
          :placeholder="groupPlaceholder"
        >
          <template #option="optionProps">
            <div class="p-dropdown-car-option">
              <span>{{ optionProps.option.label }}</span>
            </div>
          </template>
        </Dropdown>
      </div>

      <div class="col-start-0 buttons col-span-8 mt-1 justify-end text-right">
        <Button class="btn-gray" @click="cancel()">
          <span v-if="editable">{{ $t('global.labels.cancel') }}</span>
          <span v-else>{{ $t('global.labels.close') }}</span>
        </Button>
        <Button
          v-if="editable"
          type="submit"
          :disabled="!editable"
          @click="checkErrors()"
          >{{ $t('global.labels.save') }}</Button
        >
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
  @import '../../styles/components/moreTable-dialogs.pcss';

  .dropdown-btn {
    &.is-empty {
      background-color: var(--primary-color);
      color: white;
      :deep(.p-dropdown-label),
      :deep(.p-dropdown-trigger-icon) {
        color: white;
      }
    }
  }
</style>

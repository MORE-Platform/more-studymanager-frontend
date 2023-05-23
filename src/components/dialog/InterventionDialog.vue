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

  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused;

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
    if (externalErrors.value.length === 0) {
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
  }

  function getError(label: string): string | null | undefined {
    const item = errors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
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
      } else {
        return value;
      }
    });
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
  <div class="dialog" :class="editable ? '' : 'dialog-disabled'">
    <div class="mb-4" :class="editable ? '' : 'pb-4'">
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
      <div class="col-start-0 col-span-6" :class="editable ? '' : 'pb-4'">
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
      <div class="col-start-0 col-span-8 grid grid-cols-2 lg:grid-cols-3">
        <h5 class="lg:col-span-2" :class="editable ? 'mb-2' : ''">
          {{ $t('intervention.props.trigger') }}*
        </h5>
        <div class="col-span-1" :class="editable ? '' : 'text-end'">
          <div v-if="!editable" class="inline font-bold">Trigger-Type:</div>
          <Dropdown
            v-model="triggerType"
            :options="triggerTypesOptions"
            class="col-span-1 w-full"
            :class="editable && !getError('trigger') ? 'mb-4' : 'p-0'"
            option-label="label"
            option-value="value"
            required
            :disabled="!editable"
            :placeholder="$t('intervention.placeholder.trigger')"
            @change="setTriggerConfig(triggerType)"
          />
        </div>
        <div v-if="getError('trigger')" class="error col-span-8 mb-4">
          {{ getError('trigger') }}
        </div>
        <div
          v-if="triggerEmptyError && editable"
          class="error col-start-0 col-span-8 lg:col-span-3"
        >
          {{ triggerEmptyError }}
        </div>
        <div class="col-start-0 col-span-3">
          <!-- eslint-disable vue/no-v-html -->
          <div v-if="triggerJsonError && editable" class="error mb-4">
            {{ triggerJsonError }}
          </div>
          <CronSchedulerConfiguration
            v-show="showScheduleInput"
            v-if="showScheduleInput"
            v-model="triggerProp"
            class="mb-4"
            :trigger-props="triggerProp"
            :editable="editable"
            @on-valid-schedule="setCronSchedule($event)"
            @on-error="checkExternalErrors($event)"
          ></CronSchedulerConfiguration>
          <div v-if="!editable && hasAdditionalTriggerConfig" class="mb-2">
            {{ $t('cronSchedule.additionalConfig') }}
          </div>
          <Textarea
            v-show="hasAdditionalTriggerConfig"
            v-model="nonScheduleInput"
            required
            :disabled="!editable"
            :placeholder="$t('intervention.description.provideTriggerConfig')"
            :auto-resize="true"
            style="width: 100%"
          ></Textarea>
        </div>

        <div class="col-start-0 col-span-6">
          <InterventionTriggerConditions />
        </div>
      </div>

      <div class="col-start-0 col-span-8 grid grid-cols-9">
        <div class="col-span-9 grid grid-cols-2 lg:grid-cols-3">
          <h5 class="lg:col-span-2" :class="editable ? 'mb-2' : ''">
            {{ $t('intervention.props.action') }}*
          </h5>
          <Button
            v-if="editable"
            class="splitButton disable-left lg:cols-pan-1 w-full"
            type="button"
            :label="
              t('global.labels.new') + ' ' + t('intervention.props.action')
            "
            :icon="'pi pi-plus'"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            :disabled="!editable"
            @click="actionToggle"
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
            <div class="mb-4" v-html="getActionDescription(action.type)"></div>
            <div class="col-span-4 justify-end"></div>
            <div v-if="actionJsonError[index] && editable" class="error mb-4">
              {{ actionJsonError[index] }}
            </div>

            <Textarea
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

      <div class="col-start-0 buttons col-span-8 mt-8 justify-end text-right">
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
</style>

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
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
    ListComponentsComponentTypeEnum,
  } from '../../generated-sources/openapi';
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import PropertyInputs from './shared/PropertyInputs.vue';

  import { CronProperty, Property } from '../../models/InputModels';
  import ActionProperty from './shared/ActionProperty.vue';
  import { PropertyEmit, StringEmit } from '../../models/PropertyInputModels';

  const { componentsApi } = useComponentsApi();
  const studyStore = useStudyStore();
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const intervention: Intervention = dialogRef.value.data?.intervention || {};
  const actionsData: Action[] = dialogRef.value.data?.actionsData;
  const triggerData: Trigger = dialogRef.value.data?.triggerData;
  const groupStates: MoreTableChoice[] =
    dialogRef.value.data?.groupStates || [];
  const groupPlaceholder =
    dialogRef.value.data?.groupPlaceholder ||
    t('global.placeholder.entireStudy');
  const actionFactories = dialogRef.value.data?.actionFactories;
  const triggerFactories = dialogRef.value.data?.triggerFactories;

  let propInputError: string = '';

  /* parses the trigger properties as Property to validate and work with it - makes it easy extandable*/
  function getTriggerProperties(tType: string): Property<any>[] | undefined {
    const triggerTypeProps = triggerFactories.find(
      (tf: any) => tf.componentId === tType,
    ).properties;

    let properties: Property<any>[] = triggerTypeProps.map((json: any) =>
      Property.fromJson(json),
    );

    if (
      typeof triggerData !== 'undefined' &&
      typeof triggerData.properties !== 'undefined'
    ) {
      properties = properties.map((p: Property<any>) =>
        triggerData.properties
          ? p.setValue(triggerData.properties?.[p.id])
          : p.setValue(p.defaultValue),
      );
    } else {
      properties = properties.map((p: Property<any>) =>
        p.setValue(p.defaultValue),
      );
    }

    return properties;
  }

  /*trigger type options are used for the trigger type dropdown to switch between and provide a specific description*/
  const triggerTypesOptions = triggerFactories.map((tf: any) => ({
    label: t(tf.title),
    value: tf.componentId,
    description: t(tf.description),
  }));

  /*gets the trigger description by type value*/
  function getTriggerTypeDescription(triggerType: string): string {
    const trigger = triggerTypesOptions.find(
      (tto: any) => tto.value === triggerType,
    );
    return trigger.description;
  }

  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused ||
    studyStore.study.status === StudyStatus.PausedPreview;

  const title = ref(intervention.title);
  const purpose = ref(intervention.purpose);
  const studyGroupId = ref(intervention.studyGroupId);

  const triggerType: Ref<string> = ref(
    dialogRef?.value?.data?.triggerData?.type
      ? dialogRef.value.data.triggerData.type
      : undefined,
  );

  const actionsArray: Ref<Action[]> = ref(actionsData || []);
  const triggerProperties: Ref<Property<any>[] | undefined> = ref(
    triggerType.value ? getTriggerProperties(triggerType.value) : undefined,
  );

  const removeActions: number[] = [];

  const actionJsonError: Ref<string[]> = ref([]);
  const actionsEmptyError: Ref<string> = ref('');
  const triggerJsonError: Ref<string | undefined> = ref();

  if (actionsArray.value.length) {
    actionsArray.value = actionsArray.value.map((action: Action) => ({
      actionId: action.actionId,
      type: action.type,
      properties: action.properties,
    }));
  }

  const actionTypesOptions = ref(
    actionFactories.map((cf: ComponentFactory) => ({
      label: cf.title ? t(cf.title) : '',
      value: cf.componentId,
      command: () => {
        actionsArray.value.push({
          type: cf.componentId,
          properties: cf.defaultProperties,
        } as Action);
      },
    })),
  );

  function validate(
    component: any,
    componentType: string,
    props: any,
    i?: number,
  ) {
    return new Promise((resolve, reject) => {
      let parsedProps: any;
      try {
        if (component !== ListComponentsComponentTypeEnum.Action) {
          parsedProps = Property.toJson(props);
        } else {
          parsedProps = props;
        }

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
    if (errors.length === 0) {
      Promise.all(
        [
          ...actionsArray.value.map((action: Action, id) => ({
            component: ListComponentsComponentTypeEnum.Action,
            type: action.type,
            properties: action.properties,
            id,
          })),
          {
            component: ListComponentsComponentTypeEnum.Trigger,
            type: triggerType.value,
            properties: triggerProperties.value
              ? triggerProperties.value
              : '{}',
            id: -1,
          },
        ].map((v) =>
          validate(v.component, v.type as string, v.properties, v.id),
        ),
      )
        .then((response: any) => {
          return response;
        })
        .then((report: ValidationReport) => {
          if (!report.valid) {
            const jsonError = (report.errors || [])
              .concat(report.warnings || [])
              .map((e) => e.message)
              .join(', ');
            if (jsonError.length > 0) {
              console.error(jsonError);
            }
          }

          const actionsProps = actionsArray.value.map((action: Action) => ({
            actionId: action?.actionId,
            type: action.type,
            properties: action.properties,
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

          if (triggerProperties.value) {
            const returnObject = {
              intervention: returnIntervention,
              trigger: {
                type: triggerType.value,
                properties: Property.toJson(triggerProperties.value),
              },
              actions: actionsProps,
              removeActions: removeActions,
            };

            actionJsonError.value = [];
            triggerJsonError.value = '';

            if (actionsArray.value.length) {
              dialogRef.value.close(returnObject);
            }
          }
        })

        .catch((reason) => {
          if (reason.component === ListComponentsComponentTypeEnum.Trigger) {
            triggerJsonError.value = reason.msg;
          } else {
            const actionErrors = [];
            actionErrors[reason.i] = reason.msg;
            actionJsonError.value = actionErrors;
          }
        });
    }
  }

  let errors: MoreTableChoice[] = [];

  function checkErrors() {
    errors = [];
    if (!title.value) {
      errors.push({
        label: 'title',
        value: t('intervention.error.addTitle'),
      });
    }
    if (typeof triggerProperties.value === 'undefined') {
      errors.push({
        label: ListComponentsComponentTypeEnum.Trigger,
        value: t('intervention.error.addTriggerTypeConfig'),
      });
    }
    if (!actionsArray.value.length) {
      errors.push({
        label: ListComponentsComponentTypeEnum.Action,
        value: t('intervention.error.addAction'),
      });
    }
    if (propInputError) {
      errors.push({
        label: 'propInputError',
        value: t('intervention.error.triggerProp'),
      });
    }
  }

  function getError(label: string): string | null | undefined {
    return errors.find((el) => el.label === label)?.value;
  }

  function cancel() {
    dialogRef.value.close();
  }

  function deleteAction(actionId: number, index: number) {
    removeActions.push(actionId);
    actionsArray.value.splice(index, 1);
  }

  function nameForActionType(actionType?: string) {
    return actionFactories.find(
      (cf: ComponentFactory) => cf.componentId === actionType,
    )?.label;
  }
  function setTriggerConfig(tType: string) {
    const cronValue = triggerProperties.value?.find(
      (tp) => tp.id === 'cronSchedule',
    )?.value;
    triggerProperties.value = getTriggerProperties(tType);
    if (cronValue) {
      const cron = triggerProperties.value?.find(
        (tp) => tp.id === 'cronSchedule',
      ) as Property<CronProperty>;
      if (cron) {
        cron.value = cronValue;
      }
    }
    triggerType.value = tType;
    checkErrors();
  }

  const actionMenu = ref();
  function actionToggle(event: MouseEvent) {
    actionMenu.value.toggle(event);
  }

  function updateActionProps(action: Action, index: number) {
    actionsArray.value[index] = action;
  }

  function updateProperty(item: PropertyEmit) {
    if (triggerProperties.value) {
      triggerProperties.value[item.index].value = item.value;
    }
  }

  function propertyError(item: StringEmit) {
    propInputError = item.value;
    checkErrors();
  }

  function getLabelForChoiceValue(
    value: any,
    values: MoreTableChoice[],
  ): string | undefined {
    if (value) {
      const v = value.toString();
      return values.find((s: any) => s.value === v)?.label;
    }
    return undefined;
  }
</script>

<template>
  <div class="dialog" :class="{ 'dialog-disabled': !editable }">
    <div class="mb-5" :class="{ 'pb-4': !editable }">
      <h5 class="mb-1">
        {{ $t('intervention.dialog.title') }}
      </h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6>{{ $t('intervention.dialog.description') }}</h6>
    </div>
    <form
      id="interventionDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      :class="{ 'gap-y-2': !editable }"
      @submit.prevent="save()"
    >
      <div class="col-start-0 col-span-8 mt-2" :class="{ 'pb-4': !editable }">
        <h5>{{ $t('intervention.dialog.label.interventionTitle') }}*</h5>
        <div v-if="getError('title')" class="error col-span-8 mb-2">
          {{ getError('title') }}
        </div>
        <InputText
          v-model="title"
          class="w-full"
          type="text"
          required
          :placeholder="$t('study.placeholder.titleInput')"
          :disabled="!editable"
        ></InputText>
      </div>

      <div class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('study.props.purpose') }}</h5>
        <Textarea
          v-model="purpose"
          class="w-full"
          :placeholder="$t('study.placeholder.purposeInput')"
          :auto-resize="true"
          :disabled="!editable"
        ></Textarea>
      </div>
      <div
        class="section-group col-start-0 col-span-8 mt-4 grid grid-cols-2 items-end lg:grid-cols-3"
      >
        <h5 class="col-span-2">{{ $t('intervention.props.trigger') }}*</h5>
        <div class="col-span-3 col-start-3" :class="{ 'text-end': !editable }">
          <div class="col-span-3">
            <div v-if="!editable" class="inline font-bold">
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
        <div class="col-span-6">
          <div
            v-if="getError(ListComponentsComponentTypeEnum.Trigger)"
            class="error col-span-8 mb-4"
          >
            {{ getError(ListComponentsComponentTypeEnum.Trigger) }}
          </div>
        </div>
        <div
          v-if="triggerType"
          class="section-content col-span-2 mt-2.5 grid grid-cols-2 rounded p-5 lg:col-span-3 lg:grid-cols-3"
        >
          <div
            v-if="triggerType"
            class="col-span-8"
            :class="[
              [
                editable && !getError(ListComponentsComponentTypeEnum.Trigger)
                  ? 'mb-5'
                  : 'mb-3',
              ],
              [!triggerType ? 'is-empty' : null],
            ]"
          >
            {{ getTriggerTypeDescription(triggerType) }}
          </div>
          <div class="col-start-0 col-span-3">
            <div v-if="triggerJsonError && editable" class="error mb-4">
              {{ triggerJsonError }}
            </div>

            <div v-if="triggerProperties">
              <PropertyInputs
                :editable="editable"
                :property-list="triggerProperties"
                :context="{
                  studyId: studyStore.studyId,
                  groupId: studyGroupId,
                }"
                @on-property-change="updateProperty($event)"
                @on-error="propertyError($event)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="section-group col-start-0 col-span-8 mt-8 grid grid-cols-9">
        <div class="col-span-9 grid grid-cols-2 items-end lg:grid-cols-3">
          <h5 class="lg:col-span-2">{{ $t('intervention.props.action') }}*</h5>
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
          <div
            v-if="getError(ListComponentsComponentTypeEnum.Action)"
            class="error col-span-8 mb-4"
          >
            {{ getError(ListComponentsComponentTypeEnum.Action) }}
          </div>
          <Menu ref="actionMenu" :model="actionTypesOptions" :popup="true" />
        </div>
        <div v-if="actionsEmptyError" class="error col-span-8">
          {{ actionsEmptyError }}
        </div>
        <div
          v-if="actionsArray.length"
          class="section-content col-span-9 mt-2.5 grid grid-cols-2 rounded p-5 lg:grid-cols-3"
        >
          <div v-if="actionsArray.length" class="col-span-9">
            <div
              v-for="(action, index) in actionsArray"
              :key="index"
              class="col-start-0 js-action col-span-9"
              :class="{ 'mb-4': index < actionsArray.length - 1 }"
            >
              <hr v-if="index !== 0" class="my-4" />

              <div>
                <div class="col-span-3 inline font-bold">
                  {{ nameForActionType(action.type) }}
                </div>
              </div>

              <div class="col-span-4 justify-end"></div>
              <div v-if="actionJsonError[index] && editable" class="error mb-4">
                {{ actionJsonError[index] }}
              </div>

              <ActionProperty
                :action-factories="actionFactories as ComponentFactory[]"
                :action="action"
                :context="{
                  studyId: studyStore.studyId,
                  groupId: studyGroupId,
                }"
                :editable="editable"
                @on-action-prop-change="updateActionProps($event, index)"
              />

              <div class="buttons col-span-9 mt-2 text-end">
                <Button
                  v-if="editable"
                  :icon="'pi pi-trash'"
                  :disabled="!editable"
                  @click="
                    deleteAction(actionsArray[index].actionId as number, index)
                  "
                />
              </div>
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
          :class="{ 'dropdown-has-value': studyGroupId }"
          :placeholder="
            studyGroupId
              ? getLabelForChoiceValue(studyGroupId as number, groupStates)
              : groupPlaceholder
                ? (groupPlaceholder as string)
                : $t('global.placeholder.entireStudy')
          "
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

  :deep(.dropdown-has-value .p-dropdown-label) {
    color: var(--text-color);
  }

  .dropdown-btn {
    background-color: var(--primary-color);
    color: white;
    :deep(.p-dropdown-label),
    :deep(.p-dropdown-trigger-icon) {
      color: white;
    }
  }

  .dialog #interventionDialogForm .section-group .section-content {
    border: 1px solid var(--bluegray-50);
  }
</style>

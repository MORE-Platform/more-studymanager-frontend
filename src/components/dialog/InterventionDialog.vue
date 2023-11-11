/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Österreichische Vereinigung zur
 * Förderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
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
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import PropertyInputs from './shared/ProprtyInputs.vue';

  import {
    CronProperty,
    DataCheckProperty,
    Property,
  } from '../../models/InputModels';
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
    dialogRef.value.data?.groupPlaceholder || 'Entire Study';
  const actionFactories = dialogRef.value.data?.actionFactories;
  const triggerFactories = dialogRef.value.data?.triggerFactories;

  const propInputError: Ref<string> = ref('');

  /* parses the trigger properties as Property to validate and work with it - makes it easy extandable*/
  function getTriggerProperties(tType: string): Property<any>[] | undefined {
    const triggerTypeProps = triggerFactories.find(
      (item: any) => item.componentId === tType
    ).properties;

    const properties: Ref<Property<any>[]> = ref(
      triggerTypeProps.map((json: any) => Property.fromJson(json))
    );

    if (
      typeof triggerData !== 'undefined' &&
      typeof triggerData.properties !== 'undefined'
    ) {
      properties.value = properties.value.map((p: Property<any>) =>
        triggerData.properties
          ? p.setValue(triggerData.properties?.[p.id])
          : p.setValue(p.defaultValue)
      );
    } else {
      properties.value = properties.value.map((p: Property<any>) =>
        p.setValue(p.defaultValue)
      );
    }

    return properties.value;
  }

  /*trigger type options are used for the trigger type dropdown to switch between and provide a specific description*/
  const triggerTypesOptions = triggerFactories.map((item: any) => ({
    label: t(item.title),
    value: item.componentId,
    description: t(item.description),
  }));

  /*gets the trigger description by type value*/
  function getTriggerTypeDescription(triggerType: string): string {
    const trigger = triggerTypesOptions.find(
      (item: any) => item.value === triggerType
    );
    return trigger.description;
  }

  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused;

  const title = ref(intervention.title);
  const purpose = ref(intervention.purpose);
  const studyGroupId = ref(intervention.studyGroupId);

  const triggerType: Ref<string> = ref(
    dialogRef?.value?.data?.triggerData?.type
      ? dialogRef.value.data.triggerData.type
      : undefined
  );

  const actionsArray: Ref<any[]> = ref(actionsData || []);
  const triggerProperties: Ref<Property<any>[] | undefined> = ref(
    triggerType.value ? getTriggerProperties(triggerType.value) : undefined
  );

  const removeActions: Ref<number[]> = ref([]);

  const actionJsonError: Ref<string[]> = ref([]);
  const actionsEmptyError: Ref<string> = ref('');
  const triggerJsonError: Ref<string | undefined> = ref();
  const triggerConditionsError: Ref<string | undefined> = ref(undefined);

  const interventionRowIsOpen: Ref<boolean> = ref(false);

  if (actionsArray.value.length) {
    actionsArray.value = actionsArray.value.map((item) => ({
      actionId: item.actionId,
      type: item.type,
      properties: item.properties,
    }));
  }

  const actionTypesOptions = ref(
    actionFactories.map((item: ComponentFactory) => ({
      label: item.title ? t(item.title) : '',
      value: item.componentId,
      command: () => {
        actionsArray.value.push({
          type: item.componentId,
          properties: item.defaultProperties,
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
        if (component !== 'action') {
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
    if (externalErrors.value.length === 0 && errors.value.length === 0) {
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
            properties: triggerProperties.value
              ? triggerProperties.value
              : '{}',
            id: -1,
          },
        ].map((v) => validate(v.component, v.type, v.properties, v.id))
      )
        .then((response: any) => {
          return response;
        })
        .then((report: ValidationReport) => {
          if (report.valid) {
            console.log('is valid');
          } else {
            const jsonError = (report.errors || [])
              .concat(report.warnings || [])
              .map((e) => e.message)
              .join(', ');
            if (jsonError.length > 0) {
              console.error(jsonError);
            }
          }

          const actionsProps = actionsArray.value.map((item) => ({
            actionId: item?.actionId,
            type: item.type,
            properties: item.properties,
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
              removeActions: removeActions.value,
            };

            actionJsonError.value = [];
            triggerJsonError.value = '';

            if (actionsArray.value.length) {
              dialogRef.value.close(returnObject);
            }
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
    if (typeof triggerProperties.value === 'undefined') {
      errors.value.push({
        label: 'trigger',
        value: t('intervention.error.addTriggerTypeConfig'),
      });
    }
    if (triggerProperties.value) {
      for (const prop in triggerProperties.value) {
        if (triggerProperties.value[prop] instanceof DataCheckProperty) {
          if (triggerConditionsError.value) {
            errors.value.push({
              label: 'dataCheckTriggerConditions',
              value: triggerConditionsError.value,
            });
          }
        }
      }
    }
    if (!actionsArray.value.length) {
      errors.value.push({
        label: 'action',
        value: t('intervention.error.addAction'),
      });
    }
    if (interventionRowIsOpen.value) {
      errors.value.push({
        label: 'interventionRowIsOpen',
        value: t('intervention.error.interventionRowIsOpen'),
      });
    }
    if (propInputError.value) {
      errors.value.push({
        label: 'propInputError',
        value: 'A triggerprop has an error.',
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
    if (e) {
      externalErrors.value.push(e);
    }
  }

  function checkPropertyErrors(value: any) {
    checkErrors();
    checkExternalErrors(value);
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
    const cronValue = triggerProperties.value?.find(
      (item) => item.id === 'cronSchedule'
    )?.value;
    triggerProperties.value = getTriggerProperties(tType);

    if (cronValue) {
      const cron = triggerProperties.value?.find(
        (item) => item.id === 'cronSchedule'
      ) as Property<CronProperty>;
      cron.value = cronValue;
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
    propInputError.value = item.value;
    checkErrors();
  }

  function getLabelForChoiceValue(value: any, values: MoreTableChoice[]) {
    if (value) {
      const v = value.toString();
      return values.find((s: any) => s.value === v)?.label;
    }
    return undefined;
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
      <div
        class="section-group col-start-0 col-span-8 mt-4 grid grid-cols-2 items-end lg:grid-cols-3"
      >
        <h5 class="col-span-2">{{ $t('intervention.props.trigger') }}*</h5>
        <div class="col-span-3 col-start-3" :class="editable ? '' : 'text-end'">
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
          <div v-if="getError('trigger')" class="error col-span-8 mb-4">
            {{ getError('trigger') }}
          </div>
        </div>
        <div
          v-if="triggerType"
          class="section-content col-span-2 grid grid-cols-2 lg:col-span-3 lg:grid-cols-3"
        >
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
                @on-check-errors="checkPropertyErrors($event)"
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
          <div v-if="getError('action')" class="error col-span-8 mb-4">
            {{ getError('action') }}
          </div>
          <Menu ref="actionMenu" :model="actionTypesOptions" :popup="true" />
        </div>
        <div v-if="actionsEmptyError" class="error col-span-8">
          {{ actionsEmptyError }}
        </div>
        <div
          v-if="actionsArray.length"
          class="section-content col-span-9 grid grid-cols-2 lg:grid-cols-3"
        >
          <div v-if="actionsArray.length" class="col-span-9">
            <div
              v-for="(action, index) in actionsArray"
              :key="index"
              class="col-start-0 js-action col-span-9"
              :class="index < actionsArray.length - 1 ? 'mb-4' : ''"
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
                  @click="deleteAction(actionsArray[index].actionId, index)"
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
          :class="studyGroupId ? 'dropdown-has-value' : ''"
          :placeholder="studyGroupId ? getLabelForChoiceValue(studyGroupId as number, groupStates) : groupPlaceholder ? groupPlaceholder as string : $t('global.placeholder.entireStudy')"
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
    color: var(--text-color) !important;
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
    margin-top: 10px;
    border: 1px solid var(--bluegray-50);
    padding: 20px;
    border-radius: 4px;
  }
</style>

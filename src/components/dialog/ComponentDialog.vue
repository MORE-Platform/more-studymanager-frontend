/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache License, Version 2.0. */
<script setup lang="ts">
  import { computed, inject, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import {
    ObservationSchedule,
    StudyStatus,
    ValidationReport,
  } from '@gs/models';
  import { MoreTableChoice } from '@/models/MoreTableModel';
  import RelativeScheduler from '../shared/RelativeScheduler.vue';
  import { useDialog } from 'primevue/usedialog';
  import { useComponentsApi } from '@/composable/useApi';
  import { useStudyStore } from '@/stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import { Property } from '@/models/InputModels';
  import PropertyInputs from './shared/PropertyInputs.vue';
  import { PropertyEmit } from '@/models/PropertyInputModels';
  import SchedulerInfoBlock from '../subComponents/SchedulerInfoBlock.vue';
  import AbsoluteScheduler from '../shared/Scheduler.vue';
  import { isObjectEmpty } from '@/utils/commonUtils';
  import { ScheduleType } from '@/models/Scheduler';
  import { AxiosError } from 'axios';
  import { useErrorHandling } from '@/composable/useErrorHandling';
  import { useToastService } from '@/composable/toastService';
  import MultiSelect from 'primevue/multiselect';
  import { useObservationGroupStore } from '@/stores/observationGroupStore';
  import { useMilestoneStore } from '@/stores/milestoneStore';
  import ObservationToggle from '../subComponents/ObservationToggle.vue';
  import { extractCurrentLimeDomain } from '@/utils/limeSurveyUtils';
  import { scrollToFirstError } from '@/utils/componentUtils';
  import InfoWarningErrorSection from '@/components/shared/InfoWarningErrorSection.vue';
  import PillItem from '@/components/shared/PillItem.vue';

  const { handleToastErrors, showErrorToast } = useToastService();
  const dialog = useDialog();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();
  const studyStore = useStudyStore();
  const observationGroupStore = useObservationGroupStore();
  const milestoneStore = useMilestoneStore();
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const component = dialogRef.value.data.component;
  const errorMessage = dialogRef.value.data.errorMessage;
  const groupStates = dialogRef.value.data.groupStates || [];
  const observationGroupStates: MoreTableChoice[] =
    observationGroupStore.observationGroups.map(
      (observationGroup) =>
        ({
          label: observationGroup.title,
          value: observationGroup.observationGroupId?.toString(),
        }) as MoreTableChoice,
    );
  const factory = dialogRef.value.data.factory;
  const componentType = dialogRef.value.data.componentType || 'observation';
  const hasSimpleScheduler = dialogRef.value.data.hasSimpleScheduler as
    | { key: string; label: string; time: string }[]
    | undefined;
  const simpleSchedulerValues = dialogRef.value.data.simpleSchedulerValues;
  const hasComponentCategories = dialogRef.value.data
    .hasComponentCategories as MoreTableChoice[];
  const hasComponentKind =
    (dialogRef.value.data.hasComponentKind as string) ?? 'behavioral';
  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused ||
    studyStore.study.status === StudyStatus.PausedPreview;
  const isGoal = componentType === 'goalTemplate';

  const title = ref(component.title);
  const purpose = ref(component.purpose);
  const participantTitle = ref(component.participantTitle);
  const participantInfo = ref(component.participantInfo);
  const properties: Ref<Property<any>[]> = ref(
    factory.properties
      ?.map((json: any) => {
        try {
          return Property.fromJson(json);
        } catch (e) {
          console.warn(
            'Skipping unknown property type in dialog:',
            json.type,
            json,
            e,
          );
          return null;
        }
      })
      .filter((p: Property<any> | null): p is Property<any> => p !== null)
      .map((p: Property<any>) => p.setValue(component.properties?.[p.id])) ??
      [],
  );
  const selectedObservationGroups = ref(
    component.observationGroupIds?.map((id: number) => id.toString()) ?? [],
  );

  const hidden: Ref<boolean> = ref(
    component.hidden !== undefined
      ? component.hidden
      : (factory.visibility?.hiddenByDefault ?? false),
  );

  const reminder: Ref<boolean> = ref(
    component.reminder !== undefined ? component.reminder : false,
  );

  const scheduler: Ref<ObservationSchedule> = ref(
    component.schedule ? component.schedule : {},
  );

  const milestoneId: Ref<number | undefined> = ref(component.milestoneId);
  const selectedMilestone = computed(() =>
    milestoneStore.milestones.find((m) => m.milestoneId === milestoneId.value),
  );

  const simpleSchedulerSelection = ref(
    simpleSchedulerValues ||
      (Array.isArray(component.schedule)
        ? component.schedule.map((s: any) => s.key)
        : []),
  );

  const studyGroupId = ref(component.studyGroupId);
  const categories = ref(component.categories?.topics ?? undefined);

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

  function openScheduler(schedulerType: string): void {
    dialog.open(
      schedulerType === 'relative' ? RelativeScheduler : AbsoluteScheduler,
      {
        data: {
          scheduler: scheduler.value,
          schedulerType: scheduler.value.type,
          milestone: selectedMilestone.value,
        },
        props: {
          header:
            schedulerType === 'relative'
              ? t('scheduler.relativeDialogTitle')
              : t('scheduler.dialogTitle'),
          style: {
            width: '50vw',
          },
          breakpoints: {
            '960px': '75vw',
            '640px': '90vw',
          },
          modal: true,
          draggable: false,
        },
        onClose: (options) => {
          if (options?.data) {
            scheduler.value = options.data;
          }
        },
      },
    );
  }

  function validate(): void {
    checkRequiredFields();
    if (errors.value.length > 0) {
      scrollToFirstError();
      return;
    }

    let parsedProps: any;
    try {
      parsedProps = Property.toJson(properties.value);
      componentsApi
        .validateProperties(
          componentType,
          component.type as string,
          parsedProps,
        )
        .then((response: any) => {
          return response.data;
        })
        .then((report: ValidationReport) => {
          if (report.valid) {
            save(parsedProps);
          } else {
            handleToastErrors(report);
          }
        })
        .catch((e: AxiosError) => {
          handleIndividualError(e, 'cannot fetch study');
        });
    } catch (e: any) {
      console.error(e);
      showErrorToast(t('global.error.general'));
    }
  }

  const minDate = (date: Date): Date => {
    date.setHours(0, 0, 0);
    return date;
  };

  const maxDate = (date: Date): Date => {
    date.setHours(23, 59, 59);
    return date;
  };

  function save(props: any): void {
    if (!hasSimpleScheduler && isObjectEmpty(scheduler.value)) {
      if (studyStore.study.plannedStart && studyStore.study.plannedEnd) {
        scheduler.value = {
          type: ScheduleType.Event,
          dtstart: minDate(
            new Date(studyStore.study.plannedStart),
          ).toISOString(),
          dtend: maxDate(new Date(studyStore.study.plannedEnd)).toISOString(),
        };
      } else {
        const date = new Date();
        scheduler.value = {
          dtstart: minDate(date).toISOString(),
          dtend: maxDate(date).toISOString(),
        };
      }
    }

    if (componentType === 'observation') {
      const returnComponent = {
        observationId: component.observationId,
        title: title.value,
        purpose: purpose.value,
        participantInfo: participantInfo.value,
        observationGroupIds: selectedObservationGroups.value?.length
          ? selectedObservationGroups.value.map((id: string) => parseInt(id))
          : [],
        type: component.type,
        properties: props,
        schedule: scheduler.value,
        studyGroupId: studyGroupId.value,
        hidden: hidden.value,
        reminder: reminder.value,
        milestoneId: milestoneId.value,
      };

      if (!isObjectEmpty(scheduler.value)) {
        dialogRef.value.close(returnComponent);
      }
    } else if (componentType === 'goalTemplate') {
      const returnComponent = {
        templateId: component.templateId,
        title: title.value,
        participantTitle: participantTitle.value,
        participantInfo: participantInfo.value,
        observationGroupIds: selectedObservationGroups.value?.length
          ? selectedObservationGroups.value.map((id: string) => parseInt(id))
          : [],
        type: component.type,
        properties: props,
        adherenceChecks:
          hasSimpleScheduler
            ?.filter((s) => simpleSchedulerSelection.value.includes(s.key))
            .map((s) => s.key) ?? [],
        studyGroupId: studyGroupId.value,
        categories: {
          kind: hasComponentKind ?? 'behavioral',
          topics: categories.value,
        },
      };
      dialogRef.value.close(returnComponent);
    }
  }

  const errors: Ref<MoreTableChoice[]> = ref([]);

  function checkRequiredFields(): void {
    errors.value = [];
    if (!title.value) {
      errors.value.push({
        label: 'title',
        value: isGoal
          ? t('goaltemplate.error.addTitle')
          : t('observation.error.addTitle'),
      } as MoreTableChoice);
    }
    if (!participantInfo.value) {
      errors.value.push({
        label: 'participantInfo',
        value: isGoal
          ? t('goaltemplate.error.addParticipantInfo')
          : t('observation.error.addParticipantInfo'),
      } as MoreTableChoice);
    }
    if (hasSimpleScheduler && simpleSchedulerSelection.value.length === 0) {
      errors.value.push({
        label: 'scheduler',
        value: t('goaltemplate.error.addSchedule'),
      } as MoreTableChoice);
    }
    if (isGoal && hasComponentCategories && categories.value.length === 0) {
      errors.value.push({
        label: 'categories',
        value: t('goaltemplate.error.addCategory'),
      } as MoreTableChoice);
    }
  }

  function getError(label: string): string | null | undefined {
    return errors.value.find((el) => el.label === label)?.value;
  }

  function cancel(): void {
    dialogRef.value.close();
  }

  function removeScheduler(): void {
    if (scheduler.value) {
      scheduler.value = {};
    }
  }

  function updateProperty(item: PropertyEmit): void {
    properties.value[item.index].value = item.value;
  }
</script>

<template>
  <div class="dialog" :class="{ 'dialog-disabled': !editable }">
    <div class="mb-4" :class="{ 'pb-4': !editable }">
      <h5 class="mb-1">{{ factory.title ? $t(factory.title) : '' }}</h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6
        v-if="factory.description"
        v-html="$t(factory.description, { link: extractCurrentLimeDomain() })"
      ></h6>
    </div>

    <info-warning-error-section
      class="mb-4"
      :error-message="errorMessage || undefined"
      :error-label="t('global.labels.error')"
    />

    <form
      id="componentDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      @submit.prevent="validate()"
    >
      <div class="col-span-8 col-start-0" :class="{ 'pb-4': !editable }">
        <h5 class="mb-1">
          {{
            isGoal
              ? $t('goaltemplate.label.goalTitle')
              : $t('observation.dialog.label.observationTitle')
          }}*
        </h5>
        <div v-if="getError('title')" class="error error-label mb-4">
          {{ getError('title') }}
        </div>
        <div class="col-span-8 col-start-0" :class="{ 'pb-4': !editable }">
          <InputText
            v-model="title"
            type="text"
            required
            :placeholder="$t('study.placeholder.titleInput')"
            class="w-full"
            :disabled="!editable"
          ></InputText>
        </div>
      </div>
      <div
        v-if="isGoal && hasComponentCategories"
        class="col-span-8 col-start-0"
        :class="{ 'pb-4': !editable }"
      >
        <h5 class="mb-1">{{ $t('goaltemplate.label.categoryTitle') }}*</h5>
        <div v-if="getError('categories')" class="error error-label mb-4">
          {{ getError('categories') }}
        </div>
        <div class="flex flex-row flex-nowrap items-center gap-6 text-nowrap">
          <div class="flex w-full min-w-0 items-center gap-2">
            <span class="font-bold whitespace-nowrap"
              >{{ t('goaltemplate.props.categoryTitle') }}:</span
            >
            <MultiSelect
              v-model="categories"
              :options="hasComponentCategories"
              option-label="label"
              option-value="value"
              class="w-full"
              :show-toggle-all="false"
              :disabled="!editable"
              :placeholder="
                $t('global.placeholder.chooseDropdownOptionDefault')
              "
            ></MultiSelect>
          </div>
          <div
            v-if="hasComponentKind"
            class="flex items-center gap-2 whitespace-nowrap"
          >
            <span class="font-bold"
              >{{ t('goaltemplate.props.goalType') }}:
            </span>
            <pill-item
              :label="t(`goaltemplate.factory.type.${hasComponentKind}Goal`)"
            />
          </div>
        </div>
      </div>
      <div v-if="hasSimpleScheduler" class="col-span-8 col-start-0">
        <h5 class="mb-1">{{ $t('scheduler.singular') }}*</h5>
        <div v-if="getError('scheduler')" class="error error-label mb-4">
          {{ getError('scheduler') }}
        </div>
        <div v-if="hasSimpleScheduler.length > 0">
          <div class="mb-2">
            {{ $t('goaltemplate.goalTemplateList.meassurementTimes.planer') }}
          </div>
          <MultiSelect
            v-model="simpleSchedulerSelection"
            :options="hasSimpleScheduler"
            :show-toggle-all="false"
            option-label="label"
            option-value="key"
            class="w-full"
            :disabled="!editable"
            :placeholder="$t('global.placeholder.chooseDropdownOptionDefault')"
            :show-select-all="false"
          >
            <template #option="slotProps">
              <div class="flex items-center">
                <div>
                  {{ slotProps.option.label }}
                  <span v-if="slotProps.option.time">
                    ({{ slotProps.option.time.slice(0, 5) }})
                  </span>
                </div>
              </div>
            </template>
            <template #value="slotProps">
              <div v-if="slotProps.value && slotProps.value.length > 0">
                {{
                  hasSimpleScheduler
                    .filter((s) => slotProps.value.includes(s.key))
                    .map((s) => s.label)
                    .join(', ')
                }}
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
          </MultiSelect>
        </div>
        <info-warning-error-section
          v-else
          :is-warning="true"
          :error-message="$t('goaltemplate.error.noSimpleSchedulerOptions')"
          :error-label="$t('global.labels.warning')"
        />
      </div>
      <template v-else>
        <div
          v-if="
            componentType === 'observation' &&
            milestoneStore.milestones.length > 0
          "
          class="col-span-8 col-start-0 mb-2"
        >
          <h5 class="mb-1">{{ $t('milestone.singular') }}</h5>
          <Dropdown
            v-model="milestoneId"
            :options="milestoneStore.milestones"
            option-label="name"
            option-value="milestoneId"
            show-clear
            :disabled="!editable"
            :placeholder="
              $t('scheduler.dialog.relativeSchedule.milestone.placeholder')
            "
          />
        </div>
        <SchedulerInfoBlock
          :scheduler="scheduler"
          :editable="editable"
          :error="
            getError('scheduler') ? (getError('scheduler') as string) : ''
          "
          :milestone="selectedMilestone"
          class="mb-2"
          @open-dialog="openScheduler($event)"
          @remove-scheduler="removeScheduler"
        />
      </template>

      <div
        v-if="componentType === 'observation'"
        class="col-span-8 col-start-0"
      >
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
        v-if="componentType === 'goalTemplate'"
        class="col-span-8 mt-6 mb-3 h-[1px] w-full bg-gray-300"
      />
      <div
        v-if="componentType === 'goalTemplate'"
        class="col-span-8 col-start-0"
      >
        <h5 class="mb-2">{{ $t('study.props.participantTitle') }}*</h5>
        <InputText
          v-model="participantTitle"
          type="text"
          required
          :placeholder="
            $t('study.placeholder.participantTitle', {
              type: $t(`global.labels.${componentType}`),
            })
          "
          class="w-full"
          :disabled="!editable"
        ></InputText>
      </div>
      <div class="col-span-8 col-start-0">
        <h5 :class="getError('participantInfo') ? 'mb-1' : 'mb-2'">
          {{ $t('study.props.participantInfo') }}*
        </h5>
        <div v-if="getError('participantInfo')" class="error error-label mb-4">
          {{ getError('participantInfo') }}
        </div>
        <Textarea
          v-model="participantInfo"
          class="w-full"
          required
          :placeholder="$t('study.placeholder.participantInfoInput')"
          :auto-resize="true"
          :disabled="!editable"
        ></Textarea>
      </div>
      <div v-if="properties.length" class="col-span-8 col-start-0">
        <h5 v-if="componentType === 'observation'" class="mb-2">
          {{ $t('global.labels.config') }}
        </h5>
        <div class="col-span-8 col-start-0">
          <div v-if="properties">
            <PropertyInputs
              :editable="editable"
              :property-list="properties"
              :context="{
                studyId: studyStore.studyId,
                groupId: studyGroupId,
              }"
              @on-property-change="updateProperty($event)"
            />
          </div>
        </div>
      </div>

      <hr class="col-span-8 mt-5 mb-2 text-gray-300" />

      <div class="col-span-8 col-start-0 flex items-center justify-between">
        <div>
          <h5 v-if="editable" class="pb-2 font-bold">
            {{
              editable
                ? $t('study.dialog.label.chooseGroups')
                : $t('study.props.groups')
            }}
          </h5>
          <div v-if="editable" class="mb-2">
            {{
              $t('study.dialog.description.howToCreateGroups', {
                for: isGoal
                  ? $t('studyNavigation.tabs.goals')
                  : $t('studyNavigation.tabs.observations'),
              })
            }}
          </div>
          <div class="flex gap-5">
            <div>
              <div class="mb-1">{{ $t('studyGroup.plural') }}</div>
              <Dropdown
                v-model="studyGroupId"
                :options="groupStates"
                option-label="label"
                option-value="value"
                :disabled="!editable"
                :class="{ 'dropdown-has-value': studyGroupId }"
                :placeholder="
                  getLabelForChoiceValue(studyGroupId, groupStates) ||
                  $t('global.placeholder.entireStudy')
                "
              />
            </div>
            <div>
              <div class="mb-1">{{ $t('observationGroup.plural') }}</div>
              <MultiSelect
                v-model="selectedObservationGroups"
                :options="observationGroupStates"
                :disabled="!editable"
                option-label="label"
                option-value="value"
                :placeholder="
                  $t('global.placeholder.chooseDropdownOptionDefault')
                "
                :show-toggle-all="false"
                class="z-top custom-multiselect-root"
                :panel-class="'custom-multiselect-panel'"
              >
                <template #value="{ value }">
                  <span v-if="value?.length > 0">{{
                    value
                      .map(
                        (item: string) =>
                          observationGroupStates.find(
                            (group: MoreTableChoice) => group.value === item,
                          )?.label,
                      )
                      .join(', ')
                  }}</span>
                  <span v-else class="text-gray-400">
                    {{ $t('global.placeholder.chooseDropdownOptionDefault') }}
                  </span>
                </template>
              </MultiSelect>
            </div>
          </div>
        </div>
      </div>

      <div
        class="buttons col-span-8 col-start-0 mt-1 flex flex-row items-center justify-between"
      >
        <div
          v-if="componentType === 'observation'"
          class="flex flex-wrap justify-items-center gap-3"
        >
          <ObservationToggle
            v-model="hidden"
            :editable="editable"
            :changeable="factory.visibility?.changeable ?? false"
            :info-text="$t('observation.dialog.msg.hiddenInfo')"
            :label="$t(`observation.props.hidden.${hidden}`)"
            enabled-icon="pi-eye-slash"
            disabled-icon="pi-eye"
          />
          <ObservationToggle
            v-model="reminder"
            :editable="editable"
            :info-text="$t('observation.dialog.msg.reminderInfo')"
            :label="$t(`observation.props.reminder.${reminder}`)"
            enabled-icon="pi-bell"
            disabled-icon="pi-bell-slash"
          />
        </div>
        <div
          class="flex flex-row items-center justify-end text-right"
          :class="componentType === 'observation' ? 'w-auto' : 'w-full'"
        >
          <Button class="btn-gray" @click="cancel()">
            <span v-if="editable">{{ $t('global.labels.cancel') }}</span>
            <span v-else>{{ $t('global.labels.close') }}</span>
          </Button>
          <Button
            v-if="editable"
            :type="editable ? 'submit' : 'button'"
            :label="$t('global.labels.save')"
            :disabled="!editable"
            @click="
              checkRequiredFields();
              scrollToFirstError();
            "
          />
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
  @import '../../styles/components/moreTable-dialogs.css';
  @import '../../styles/components/eye-checkbox.css';

  .dialog {
    .day {
      &:after {
        content: ', ';
      }

      &:last-of-type:after {
        content: '';
      }
    }

    .info-box {
      &-hidden {
        width: 20vw;
        border: 1px solid var(--bluegray-200);
        transition: ease-in-out opacity 0.25s;
        box-shadow: 1px 1px 5px var(--bluegray-200);
      }

      &:hover {
        .info-box-hidden {
          opacity: 1;
        }
      }
    }
  }
</style>

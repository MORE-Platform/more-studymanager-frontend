/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import {
    Observation,
    ObservationSchedule,
    StudyStatus,
    ValidationReport,
  } from '@gs/models';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import RelativeScheduler from '../shared/RelativeScheduler.vue';
  import { useDialog } from 'primevue/usedialog';
  import { useComponentsApi } from '../../composable/useApi';
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import { Property } from '../../models/InputModels';
  import PropertyInputs from './shared/PropertyInputs.vue';
  import { PropertyEmit } from '../../models/PropertyInputModels';
  import SchedulerInfoBlock from '../subComponents/SchedulerInfoBlock.vue';
  import AbsoluteScheduler from '../shared/Scheduler.vue';
  import { isObjectEmpty } from '../../utils/commonUtils';
  import { ScheduleType } from '../../models/Scheduler';
  import { AxiosError } from 'axios';
  import { useErrorHandling } from '../../composable/useErrorHandling';
  import { useToastService } from '../../composable/toastService';
  import MultiSelect from 'primevue/multiselect';
  import { useObservationGroupStore } from '../../stores/observationGroupStore';
  import ObservationToggle from '../subComponents/ObservationToggle.vue';
  import { extractCurrentLimeDomain } from '../../utils/limeSurveyUtils';

  const { handleToastErrors, showErrorToast } = useToastService();
  const dialog = useDialog();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();
  const studyStore = useStudyStore();
  const observationGroupStore = useObservationGroupStore();
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const observation = dialogRef.value.data.observation as Observation;
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
  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused ||
    studyStore.study.status === StudyStatus.PausedPreview;

  const title = ref(observation.title);
  const purpose = ref(observation.purpose);
  const participantInfo = ref(observation.participantInfo);
  const properties: Ref<Property<any>[]> = ref(
    factory.properties
      .map((json: any) => Property.fromJson(json))
      .map((p: Property<any>) => p.setValue(observation.properties?.[p.id])),
  );
  const selectedObservationGroups = ref(
    observation.observationGroupIds?.map((id: number) => id.toString()) ?? [],
  );

  const hidden: Ref<boolean> = ref(
    observation.hidden !== undefined
      ? observation.hidden
      : factory.visibility.hiddenByDefault,
  );

  const reminder: Ref<boolean> = ref(
    observation.reminder !== undefined ? observation.reminder : false,
  );

  const scheduler: Ref<ObservationSchedule> = ref(
    observation.schedule ? observation.schedule : {},
  );

  const studyGroupId = ref(observation.studyGroupId);

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
    let parsedProps: any;
    try {
      parsedProps = Property.toJson(properties.value);
      componentsApi
        .validateProperties(
          'observation',
          observation.type as string,
          parsedProps,
        )
        .then((response: any) => response.data)
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
    if (isObjectEmpty(scheduler.value)) {
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

    const returnObservation = {
      observationId: observation.observationId,
      title: title.value,
      purpose: purpose.value,
      participantInfo: participantInfo.value,
      observationGroupIds: selectedObservationGroups.value?.length
        ? selectedObservationGroups.value.map((id: string) => parseInt(id))
        : [],
      type: observation.type,
      properties: props,
      schedule: scheduler.value,
      studyGroupId: studyGroupId.value,
      hidden: hidden.value,
      reminder: reminder.value,
    } as Observation;

    if (!isObjectEmpty(scheduler.value)) {
      dialogRef.value.close(returnObservation);
    }
  }

  let errors: MoreTableChoice[] = [];

  function checkRequiredFields(): void {
    errors = [];
    if (!title.value) {
      errors.push({
        label: 'title',
        value: t('observation.error.addTitle'),
      } as MoreTableChoice);
    }
    if (!participantInfo.value) {
      errors.push({
        label: 'participantInfo',
        value: t('observation.error.addParticipantInfo'),
      } as MoreTableChoice);
    }
  }

  function getError(label: string): string | null | undefined {
    return errors.find((el) => el.label === label)?.value;
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
      <h5 class="mb-1">{{ $t(factory.title) }}</h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6
        v-if="factory.description"
        v-html="$t(factory.description, { link: extractCurrentLimeDomain() })"
      ></h6>
    </div>

    <form
      id="observationDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      @submit.prevent="validate()"
    >
      <div class="col-span-8 col-start-0" :class="{ 'pb-4': !editable }">
        <h5 class="mb-1">
          {{ $t('observation.dialog.label.observationTitle') }}*
        </h5>
        <div v-if="getError('title')" class="error mb-4">
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
      <SchedulerInfoBlock
        :scheduler="scheduler"
        :editable="editable"
        :error="getError('scheduler') ? (getError('scheduler') as string) : ''"
        class="mb-2"
        @open-dialog="openScheduler($event)"
        @remove-scheduler="removeScheduler"
      />

      <div class="col-span-8 col-start-0">
        <h5 class="mb-2">{{ $t('study.props.purpose') }}</h5>
        <Textarea
          v-model="purpose"
          class="w-full"
          :placeholder="$t('study.placeholder.purposeInput')"
          :auto-resize="true"
          :disabled="!editable"
        ></Textarea>
      </div>
      <div class="col-span-8 col-start-0">
        <h5 :class="getError('participantInfo') ? 'mb-1' : 'mb-2'">
          {{ $t('study.props.participantInfo') }}*
        </h5>
        <div v-if="getError('participantInfo')" class="error mb-4">
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
        <h5 class="mb-2">{{ $t('global.labels.config') }}</h5>
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
                for: $t('studyNavigation.tabs.observations'),
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

      <div class="buttons col-span-8 col-start-0 mt-1 grid grid-cols-2">
        <div class="flex flex-wrap justify-items-center gap-3">
          <ObservationToggle
            v-model="hidden"
            :editable="editable"
            :changeable="factory.visibility.changeable"
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
        <div class="flex flex-row items-center justify-end text-right">
          <Button class="btn-gray" @click="cancel()">
            <span v-if="editable">{{ $t('global.labels.cancel') }}</span>
            <span v-else>{{ $t('global.labels.close') }}</span>
          </Button>
          <Button
            v-if="editable"
            :type="editable ? 'submit' : 'button'"
            :label="$t('global.labels.save')"
            :disabled="!editable"
            @click="checkRequiredFields()"
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
  :deep(.dropdown-has-value .p-select-label) {
    color: var(--text-color);
  }

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

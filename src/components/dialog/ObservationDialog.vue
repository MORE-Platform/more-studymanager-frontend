<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import {
    Observation,
    ValidationReport,
    StudyStatus,
    ObservationSchedule,
  } from '../../generated-sources/openapi';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import Scheduler from '../shared/Scheduler.vue';
  import RelativeScheduler from '../shared/RelativeScheduler.vue';
  import { useDialog } from 'primevue/usedialog';
  import { useComponentsApi } from '../../composable/useApi';
  import { useStudyStore } from '../../stores/studyStore';
  import { useI18n } from 'vue-i18n';
  import { Property } from '../../models/InputModels';
  import Checkbox from 'primevue/checkbox';
  import PropertyInputs from './shared/ProprtyInputs.vue';
  import { PropertyEmit } from '../../models/PropertyInputModels';
  import SchedulerInfoBlock from '../subComponents/SchedulerInfoBlock.vue';

  const dialog = useDialog();
  const { componentsApi } = useComponentsApi();
  const studyStore = useStudyStore();
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const observation = dialogRef.value.data.observation as Observation;
  const groupStates = dialogRef.value.data.groupStates || [];
  const factory = dialogRef.value.data.factory;
  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused;

  const title = ref(observation.title);
  const noSchedule = ref(observation.noSchedule);
  const purpose = ref(observation.purpose);
  const participantInfo = ref(observation.participantInfo);
  // properties = configuration
  const properties: Ref<Property<any>[]> = ref(
    factory.properties
      .map((json: any) => Property.fromJson(json))
      .map((p: Property<any>) => p.setValue(observation.properties?.[p.id]))
  );

  const hidden: Ref<boolean> = ref(
    observation.hidden !== undefined
      ? observation.hidden
      : factory.visibility.hiddenByDefault
  );

  const scheduler: Ref<ObservationSchedule> = ref(
    observation.schedule ? observation.schedule : {}
  );

  const studyGroupId = ref(observation.studyGroupId);

  const jsonError = ref();

  function getLabelForChoiceValue(value: any, values: MoreTableChoice[]) {
    if (value) {
      const v = value.toString();
      return values.find((s: any) => s.value === v)?.label;
    }
    return undefined;
  }

  function openScheduler(schedulerType: string) {
    dialog.open(schedulerType === 'relative' ? RelativeScheduler : Scheduler, {
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
    });
  }
  function validate() {
    let parsedProps: any;
    try {
      parsedProps = Property.toJson(properties.value);
      componentsApi
        .validateProperties(
          'observation',
          observation.type as string,
          parsedProps
        )
        .then((response: any) => response.data)
        .then((report: ValidationReport) => {
          if (report.valid) {
            save(parsedProps);
          } else {
            jsonError.value = (report.errors || [])
              .concat(report.warnings || [])
              .map((e) => e.message)
              .join(', ');
          }
        });
    } catch (e: any) {
      jsonError.value =
        t('observation.error.noValidField') + " '" + e.key + "': " + e.message;
    }
  }

  function save(props: any) {
    if (JSON.stringify(scheduler.value) === '{}' && noSchedule.value) {
      if (studyStore.study.plannedStart && studyStore.study.plannedEnd) {
        scheduler.value = {
          dtstart: new Date(studyStore.study.plannedStart).toISOString(),
          dtend: new Date(studyStore.study.plannedEnd).toISOString(),
        };
      } else {
        scheduler.value = {
          dtstart: new Date().toISOString(),
          dtend: new Date().toISOString(),
        };
      }
    }

    const returnObservation = {
      observationId: observation.observationId,
      title: title.value,
      purpose: purpose.value,
      participantInfo: participantInfo.value,
      type: observation.type,
      properties: props,
      schedule: scheduler.value,
      studyGroupId: studyGroupId.value,
      hidden: hidden.value,
      noSchedule: noSchedule.value,
    } as Observation;

    if (JSON.stringify(scheduler.value) !== '{}') {
      dialogRef.value.close(returnObservation);
    }
  }

  const errors: Ref<Array<MoreTableChoice>> = ref([]);
  const schedulerError: Ref<boolean> = ref(false);

  function checkRequiredFields() {
    errors.value = [];
    schedulerError.value = false;
    if (!title.value) {
      errors.value.push({
        label: 'title',
        value: t('observation.error.addTitle'),
      });
    }
    if (JSON.stringify(scheduler.value) === '{}' && !noSchedule.value) {
      errors.value.push({
        label: 'scheduler',
        value: t('observation.error.addSchedulerMsg'),
      });
      schedulerError.value = true;
    }
    if (!participantInfo.value) {
      errors.value.push({
        label: 'participantInfo',
        value: t('observation.error.addParticipantInfo'),
      });
    }
  }

  function getError(label: string): string | null | undefined {
    const item = errors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
  }

  function cancel() {
    dialogRef.value.close();
  }

  function removeScheduler() {
    if (scheduler.value) {
      scheduler.value = {};
    }
  }

  function updateProperty(item: PropertyEmit) {
    properties.value[item.index].value = item.value;
  }
</script>

<template>
  <div class="dialog" :class="editable ? '' : 'dialog-disabled'">
    <div class="mb-4" :class="editable ? '' : 'pb-4'">
      <h5 class="mb-1">{{ $t(factory.title) }}</h5>
      <!-- eslint-disable vue/no-v-html -->
      <h6 v-if="factory.description" v-html="$t(factory.description)"></h6>
    </div>

    <form
      id="observationDialogForm"
      class="grid grid-cols-8 items-center gap-4"
      @submit.prevent="validate()"
    >
      <div class="col-start-0 col-span-8" :class="editable ? '' : 'pb-4'">
        <h5 class="mb-1">
          {{ $t('observation.dialog.label.observationTitle') }}*
        </h5>
        <div v-if="getError('title')" class="error mb-4">
          {{ getError('title') }}
        </div>
        <div class="col-start-0 col-span-8" :class="editable ? '' : 'pb-4'">
          <InputText
            v-model="title"
            type="text"
            required
            :placeholder="$t('study.placeholder.titleInput')"
            style="width: 100%"
            class="w-full"
            :disabled="!editable"
          ></InputText>
        </div>
      </div>
      <div
        class="col-start-0 col-span-8 grid grid-cols-7 items-start justify-start gap-4"
      >
        <label for="noSchedule">{{ $t('observation.props.noSchedule') }}</label>
        <Checkbox v-model="noSchedule" :binary="true" />
      </div>
      <SchedulerInfoBlock
        v-if="!noSchedule && scheduler.type === 'Event'"
        :scheduler="scheduler"
        :editable="editable"
        :error="
          getError('scheduler') ?
          getError('scheduler') as string :
          ''
        "
        class="mb-2"
        @open-dialog="openScheduler($event)"
        @remove-scheduler="removeScheduler"
      />

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
      <div class="col-start-0 col-span-8">
        <h5 :class="getError('participantInfo') ? 'mb-1' : 'mb-2'">
          {{ $t('study.props.participantInfo') }}*
        </h5>
        <div v-if="getError('participantInfo')" class="error mb-4">
          {{ getError('participantInfo') }}
        </div>
        <Textarea
          v-model="participantInfo"
          required
          :placeholder="$t('study.placeholder.participantInfoInput')"
          :auto-resize="true"
          style="width: 100%"
          :disabled="!editable"
        ></Textarea>
      </div>
      <div v-if="properties.length" class="col-start-0 col-span-8">
        <h5 class="mb-2">{{ $t('global.labels.config') }}</h5>
        <div v-if="jsonError" class="error mb-3">{{ jsonError }}</div>
        <div class="col-start-0 col-span-8">
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

      <div
        class="col-start-0 col-span-8 flex items-center justify-between"
        :class="[studyGroupId ? 'groupIdValue' : '']"
      >
        <div>
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
            :placeholder="
              getLabelForChoiceValue(studyGroupId, groupStates) ||
              $t('global.placeholder.entireStudy')
            "
          />
        </div>

        <div class="info-box relative">
          <!-- if editable with checkbox-->
          <div v-if="editable" class="inline flex items-center">
            <span v-if="hidden" class="ml-1 inline">
              {{ $t('observation.props.hidden.true') }}
            </span>
            <span v-else class="ml-1 inline">
              {{ $t('observation.props.hidden.false') }}
            </span>
            <span class="pi pi-info-circle color-primary ml-1 mr-4"></span>

            <Checkbox
              v-if="factory.visibility.changeable"
              v-model="hidden"
              :binary="true"
              class="icon-checkbox show-icon icon-box eye mr-2 inline"
            />
            <div v-else class="icon-box eye inline">
              <span
                class="pi mr-0.5"
                :class="
                  hidden
                    ? 'pi-eye-slash color-important'
                    : 'pi-eye color-approved'
                "
              />
            </div>
          </div>

          <!-- if not editable -->
          <div v-else class="icon-box eye preview inline flex items-center">
            <span class="ml-1 inline">{{
              $t(`observation.props.hidden.${hidden}`)
            }}</span>
            <span class="pi pi-info-circle color-primary ml-1 mr-0.5"></span>
            <span
              class="pi mr-0.5"
              :class="
                observation.hidden
                  ? 'pi-eye-slash color-important'
                  : 'pi-eye color-approved'
              "
            />
          </div>

          <div class="inline">
            <div class="info-box-hidden">
              {{ $t('observation.dialog.msg.hiddenInfo') }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-start-0 buttons col-span-8 mt-1 justify-end text-right">
        <Button class="btn-gray" @click="cancel()">
          <span v-if="editable">{{ $t('global.labels.cancel') }}</span>
          <span v-else>{{ $t('global.labels.close') }}</span>
        </Button>
        <Button
          v-if="editable"
          :type="editable ? 'submit' : undefined"
          :disabled="!editable"
          @click="checkRequiredFields()"
          >{{ $t('global.labels.save') }}</Button
        >
      </div>
    </form>
  </div>
</template>

<style scoped lang="postcss">
  @import '../../styles/components/moreTable-dialogs.pcss';
  @import '../../styles/components/eye-checkbox.pcss';
  .dialog {
    :deep(.dropdown-has-value .p-dropdown-label) {
      color: var(--text-color) !important;
    }

    .day {
      &:after {
        content: ', ';
      }
      &:last-of-type:after {
        content: '';
      }
    }
    .groupIdValue {
      color: var(--text-color);
    }

    .info-box {
      z-index: 100;
      padding: 10px 0;
      cursor: pointer;

      &-hidden {
        position: absolute;
        bottom: 100%;
        right: 0;
        width: 20vw;
        text-align: center;
        background-color: white;
        border: 1px solid var(--bluegray-200);
        padding: 20px;
        opacity: 0;
        pointer-events: none;
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

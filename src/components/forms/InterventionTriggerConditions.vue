<script setup lang="ts">
  import { MoreTableColumn } from '../../models/MoreTableModel';
  import InterventionTriggerConditionTable from './InterventionTriggerConditionTable.vue';
  import { PropType, ref, Ref } from 'vue';
  import {
    GroupConditionChange,
    InterventionTriggerUpdateData,
    InterventionTriggerUpdateItem,
  } from '../../models/InterventionTriggerModel';
  import { useStudyStore } from '../../stores/studyStore';
  import Button from 'primevue/button';
  import {
    DataCheckProperty,
    QueryObject,
    QueryObjectInner,
  } from '../../models/InputModels';
  import { useI18n } from 'vue-i18n';
  const studyStore = useStudyStore();

  const { t } = useI18n();

  const props = defineProps({
    triggerConditions: {
      type: Object as PropType<DataCheckProperty>,
      required: true,
    },
    error: {
      type: String,
      default: undefined,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });
  const triggerConditionObj: Ref<DataCheckProperty> = ref(
    props.triggerConditions
  );

  const triggerConditionColumns: Ref<MoreTableColumn[]> = ref([
    {
      field: 'observationId',
      header: 'Observation',
      editable: true,
    },
    {
      field: 'observationProperty',
      header: 'Observation Property',
      editable: true,
    },
    {
      field: 'operator',
      header: 'Operator',
      editable: true,
    },
    {
      field: 'propertyValue',
      header: 'Property Value',
      editable: true,
    },
  ]);

  const emit = defineEmits<{
    (e: 'onEmitTriggerConditions', triggerConditions: QueryObject[]): void;
    (e: 'onError', error: string): void;
  }>();

  const triggerConditionError: Ref<string | undefined> = ref('');
  const rowOpenError: Ref<string | undefined> = ref('');

  function setRowOpenError(error: boolean | string) {
    if (error) {
      rowOpenError.value = t('intervention.error.interventionRowIsOpen');
      emit('onError', rowOpenError.value);
    } else {
      rowOpenError.value = '';
      emit('onError', rowOpenError.value);
    }
  }
  function setTriggerConditionError(triggerTableE?: string) {
    triggerConditionError.value = triggerTableE;
    emit('onError', triggerTableE ? triggerTableE : '');
  }

  function emitTriggerConditions() {
    if (
      !rowOpenError.value &&
      typeof triggerConditionObj.value.value !== 'undefined'
    ) {
      emit('onEmitTriggerConditions', triggerConditionObj.value.value);
      setTriggerConditionError('');
    } else {
      setTriggerConditionError('has triggercondition error');
    }
  }

  function addTriggerGroup(groupIndex?: number) {
    setRowOpenError(true);
    if (
      (groupIndex as number) >= 0 &&
      typeof triggerConditionObj.value.value !== 'undefined'
    ) {
      triggerConditionObj.value.value[groupIndex as number].nextGroupCondition =
        'and';
    } else {
      triggerConditionObj.value.value = new Array<QueryObject>();
    }

    triggerConditionObj?.value?.value?.push({
      nextGroupCondition: undefined,
      parameter: [
        {
          observationId: undefined,
          observationType: '',
          observationProperty: '',
          operator: '',
          propertyValue: '',
          editMode: true,
          error: true,
        },
      ],
    });
    checkTriggerConditionErrors();
  }

  function setEditModeFalse() {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      triggerConditionObj.value.value.forEach((item: QueryObject) =>
        item.parameter.forEach((param) => (param.editMode = false))
      );
      emitTriggerConditions();
    }
    checkTriggerConditionErrors();
  }

  function toggleRowEdit(item: InterventionTriggerUpdateItem) {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      triggerConditionObj.value.value[item.groupIndex].parameter[
        item.rowIndex
      ].editMode = item.edit || false;

      triggerConditionObj.value.value[item.groupIndex].parameter[
        item.rowIndex
      ].error = item.edit || false;

      if (
        !item.edit &&
        !validateEditedRow(
          triggerConditionObj.value.value[item.groupIndex].parameter[
            item.rowIndex
          ]
        )
      ) {
        if (
          triggerConditionObj.value.value[item.groupIndex].parameter.length > 1
        ) {
          triggerConditionObj.value.value[item.groupIndex].parameter.splice(
            item.rowIndex,
            1
          );
        } else if (
          triggerConditionObj.value.value[item.groupIndex].parameter.length ===
          1
        ) {
          if (item.groupIndex === 0) {
            triggerConditionObj.value.value = undefined;
          } else {
            triggerConditionObj.value.value[
              item.groupIndex - 1
            ].nextGroupCondition = undefined;
            triggerConditionObj.value.value.splice(item.groupIndex, 1);
          }
        }
      }
    }
    checkTriggerConditionErrors();
  }

  function validateEditedRow(triggerConfig: QueryObjectInner): boolean {
    if (
      triggerConfig.observationId &&
      triggerConfig.observationType &&
      triggerConfig.observationProperty &&
      triggerConfig.operator &&
      triggerConfig.propertyValue
    ) {
      return true;
    } else {
      return false;
    }
  }

  function updateRowData(item: InterventionTriggerUpdateData) {
    if (validateEditedRow(item.data)) {
      item.data.error = false;
      if (typeof triggerConditionObj.value.value !== 'undefined') {
        triggerConditionObj.value.value[item.groupIndex].parameter[
          item.rowIndex
        ] = item.data;
        if (
          triggerConditionObj.value.value[item.groupIndex].parameter[
            item.rowIndex
          ].observationType === 'gps-mobile-observation'
        ) {
          triggerConditionObj.value.value[item.groupIndex].parameter[
            item.rowIndex
          ].propertyValue = triggerConditionObj.value.value[item.groupIndex]
            .parameter[item.rowIndex].propertyValue as number;
        }
        triggerConditionObj.value.value[item.groupIndex].parameter[
          item.rowIndex
        ].editMode = false;
        emitTriggerConditions();
      }
    }
  }

  function addRow(item: InterventionTriggerUpdateItem) {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      setEditModeFalse();
      triggerConditionObj.value.value[item.groupIndex].parameter.push({
        observationId: undefined,
        observationType: '',
        observationProperty: '',
        operator: '',
        propertyValue: '',
        editMode: true,
        error: false,
      });
    }
    checkTriggerConditionErrors();
  }
  function deleteRow(item: InterventionTriggerUpdateItem) {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      triggerConditionObj.value.value[item.groupIndex].parameter.splice(
        item.rowIndex,
        1
      );
      triggerConditionObj.value.value.forEach((item, index) => {
        if (!item.parameter.length) {
          triggerConditionObj.value.value?.splice(index, 1);
        }
      });
      triggerConditionObj.value.value[
        triggerConditionObj.value.value.length - 1
      ].nextGroupCondition = undefined;
    }
    checkTriggerConditionErrors();
  }

  function changeGroupCondition(item: GroupConditionChange) {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      triggerConditionObj.value.value[item.groupIndex].nextGroupCondition =
        item.value;
      emitTriggerConditions();
    }
  }

  function checkTriggerConditionErrors() {
    let hasErrors = false;
    triggerConditionObj.value?.value?.forEach((item: QueryObject) => {
      item.parameter.forEach((p) => {
        if (p.error) {
          hasErrors = true;
        }
      });
    });

    if (hasErrors) {
      emit('onError', 'Trigger Condition Table is not saved.');
    }
  }
</script>

<template>
  <div class="intervention-trigger-conditions">
    <h5 class="mb-1">
      {{ $t('intervention.dialog.label.triggerConditions') }}*
    </h5>
    <div>{{ $t('intervention.dialog.label.triggerConditionsDesc') }}</div>

    <Suspense>
      <div
        v-if="
          triggerConditionObj.value && triggerConditionObj.value.length === 0
        "
        class="mt-6 mb-6 w-full text-center"
      >
        <Button
          type="button"
          class="p-button mt-6 mb-6"
          @click="addTriggerGroup()"
          ><span class="pi pi-plus mr-2"></span>
          {{ $t('intervention.dialog.label.addTriggerGroup') }}</Button
        >
      </div>
    </Suspense>

    <Suspense>
      <div
        v-if="triggerConditionObj.value && triggerConditionObj.value.length > 0"
      >
        <InterventionTriggerConditionTable
          v-for="(condition, index) in triggerConditionObj.value"
          :key="index"
          :rows="condition.parameter"
          :group-index="index as number"
          :next-group-condition="
            condition.nextGroupCondition
              ? condition.nextGroupCondition
              : undefined
          "
          :study-id="studyStore.study.studyId as number"
          :columns="triggerConditionColumns"
          class="mt-6"
          :editable="editable"
          :row-open-error="rowOpenError ? rowOpenError : ''"
          @on-add-trigger-group="addTriggerGroup($event)"
          @on-toggle-row-edit="toggleRowEdit($event)"
          @on-update-row-data="updateRowData($event)"
          @on-delete-row="deleteRow($event)"
          @on-add-row="addRow($event)"
          @on-row-open="setRowOpenError($event)"
          @on-change-group-condition="changeGroupCondition($event)"
        />
      </div>
      <div v-else>
        <div
          v-if="
            triggerConditionObj.value !== null ||
            triggerConditionObj.value !== undefined
          "
          class="error mt-2 mb-4"
        >
          {{ $t('intervention.error.emptyTriggerConditions') }}
        </div>
        <div class="flex justify-center">
          <Button
            type="button"
            class="p-button"
            :disabled="!editable"
            @click="addTriggerGroup(-1)"
            ><span class="pi pi-plus mr-2"></span>
            {{ $t('intervention.dialog.label.addTriggerGroup') }}</Button
          >
        </div>
      </div>
    </Suspense>
  </div>
</template>

<style scoped lang="postcss"></style>

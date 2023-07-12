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
  const studyStore = useStudyStore();

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

  if (!triggerConditionObj.value.value) {
    triggerConditionObj.value.value = [
      {
        nextGroupCondition: undefined,
        parameter: [
          {
            observationId: undefined,
            observationType: '',
            observationProperty: '',
            operator: '',
            propertyValue: '',
            editMode: true,
            error: false,
          },
        ],
      },
    ];
  }

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
    (e: 'onEmitTriggerConditions', triggerConditions: DataCheckProperty): void;
    (e: 'onRowOpenError', isOpen: boolean): void;
  }>();

  const rowOpenError: Ref<boolean> = ref(false);

  function emitTriggerConditions() {
    if (
      !rowOpenError.value &&
      typeof triggerConditionObj.value.value !== 'undefined'
    ) {
      emit('onEmitTriggerConditions', triggerConditionObj.value);
    }
  }

  function addTriggerGroup(groupIndex?: number) {
    emit('onRowOpenError', true);
    if (
      (groupIndex as number) >= 0 &&
      typeof triggerConditionObj.value.value !== 'undefined'
    ) {
      setEditModeFalse();
      triggerConditionObj.value.value[groupIndex as number].nextGroupCondition =
        'and';
    }

    if (typeof triggerConditionObj.value.value === 'undefined') {
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
          error: false,
        },
      ],
    });
  }

  function setEditModeFalse() {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      triggerConditionObj.value.value.forEach((item: QueryObject) =>
        item.parameter.forEach((param) => (param.editMode = false))
      );
      emitTriggerConditions();
    }
  }

  function toggleRowEdit(item: InterventionTriggerUpdateItem) {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      triggerConditionObj.value.value[item.groupIndex].parameter[
        item.rowIndex
      ].editMode = item.edit || false;

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
          triggerConditionObj.value.value[
            item.groupIndex - 1
          ].nextGroupCondition = undefined;
          triggerConditionObj.value.value.splice(item.groupIndex, 1);
        }
      }
    }
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
  }

  function changeGroupCondition(item: GroupConditionChange) {
    if (typeof triggerConditionObj.value.value !== 'undefined') {
      triggerConditionObj.value.value[item.groupIndex].nextGroupCondition =
        item.value;
      emitTriggerConditions();
    }
  }

  function rowIsOpen(isOpen: boolean) {
    console.log('rowIsOpen', isOpen);
    emit('onRowOpenError', isOpen);
  }
</script>

<template>
  <div class="intervention-trigger-conditions">
    <div>error: {{ error }}</div>
    <h5 class="mb-1">
      {{ $t('intervention.dialog.label.triggerConditions') }}*
    </h5>
    <div>{{ $t('intervention.dialog.label.triggerConditionsDesc') }}</div>

    <div v-if="error" class="error mt-2 mb-2">{{ rowOpenError }}</div>

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
          @on-add-trigger-group="addTriggerGroup($event)"
          @on-toggle-row-edit="toggleRowEdit($event)"
          @on-update-row-data="updateRowData($event)"
          @on-delete-row="deleteRow($event)"
          @on-add-row="addRow($event)"
          @on-row-open="rowIsOpen($event)"
          @on-change-group-condition="changeGroupCondition($event)"
        />
      </div>
    </Suspense>
  </div>
</template>

<style scoped lang="postcss"></style>

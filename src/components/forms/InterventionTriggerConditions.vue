<script setup lang="ts">
  import { MoreTableColumn } from '../../models/MoreTableModel';
  import InterventionTriggerConditionTable from './InterventionTriggerConditionTable.vue';
  import { ref, Ref } from 'vue';
  import {
    GroupConditionChange,
    InterventionTriggerConfig,
    InterventionTriggerUpdateData,
    InterventionTriggerUpdateItem,
    TriggerConditionGroup,
  } from '../../models/InterventionTriggerModel';
  import { useStudyStore } from '../../stores/studyStore';
  import Button from 'primevue/button';
  const studyStore = useStudyStore();

  const triggerConditionTest: TriggerConditionGroup[] = [
    {
      nextGroupCondition: 'or',
      parameter: [
        {
          observationId: 17,
          observationType: 'acc-mobile-observation',
          observationProperty: 'x',
          operator: '>',
          propertyValue: 75,
          editMode: false,
        },
        {
          observationId: 17,
          observationType: 'acc-mobile-observation',
          observationProperty: 'y',
          operator: '=',
          propertyValue: 23,
          editMode: false,
        },
        {
          observationId: 17,
          observationType: 'acc-mobile-observation',
          observationProperty: 'x',
          operator: '=',
          propertyValue: 23,
          editMode: false,
        },
      ],
    },
    {
      nextGroupCondition: null,
      parameter: [
        {
          observationId: 17,
          observationType: 'acc-mobile-observation',
          observationProperty: 'y',
          operator: '=',
          propertyValue: 23,
          editMode: false,
        },
        {
          observationId: 17,
          observationType: 'acc-mobile-observation',
          observationProperty: 'x',
          operator: '=',
          propertyValue: 23,
          editMode: false,
        },
      ],
    },
  ];

  const triggerConditions: Ref<TriggerConditionGroup[]> =
    ref(triggerConditionTest);

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
    (
      e: 'onEmitTriggerConditions',
      triggerConditions: TriggerConditionGroup[]
    ): void;
  }>();

  function emitTriggerConditions() {
    emit('onEmitTriggerConditions', triggerConditions.value);
  }

  function addTriggerGroup(groupIndex?: number) {
    if (groupIndex) {
      setEditModeFalse();
      triggerConditions.value[groupIndex].nextGroupCondition = 'and';
    }

    triggerConditions.value.push({
      nextGroupCondition: null,
      parameter: [
        {
          observationId: undefined,
          observationType: '',
          observationProperty: '',
          operator: '',
          propertyValue: '',
          editMode: true,
        },
      ],
    });
  }

  function setEditModeFalse() {
    triggerConditions.value.forEach((item: TriggerConditionGroup) =>
      item.parameter.forEach((param) => (param.editMode = false))
    );
    emitTriggerConditions();
  }

  function toggleRowEdit(item: InterventionTriggerUpdateItem) {
    triggerConditions.value[item.groupIndex].parameter[item.rowIndex].editMode =
      item.edit || false;

    if (
      !item.edit &&
      !validateEditedRow(
        triggerConditions.value[item.groupIndex].parameter[item.rowIndex]
      )
    ) {
      if (triggerConditions.value[item.groupIndex].parameter.length > 1) {
        triggerConditions.value[item.groupIndex].parameter.splice(
          item.rowIndex,
          1
        );
      } else if (
        triggerConditions.value[item.groupIndex].parameter.length === 1
      ) {
        triggerConditions.value[item.groupIndex - 1].nextGroupCondition = null;
        triggerConditions.value.splice(item.groupIndex, 1);
      }
    }
  }

  function validateEditedRow(
    triggerConfig: InterventionTriggerConfig
  ): boolean {
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
      triggerConditions.value[item.groupIndex].parameter[item.rowIndex] =
        item.data;
      if (
        triggerConditions.value[item.groupIndex].parameter[item.rowIndex]
          .observationType === 'gps-mobile-observation'
      ) {
        triggerConditions.value[item.groupIndex].parameter[
          item.rowIndex
        ].propertyValue = triggerConditions.value[item.groupIndex].parameter[
          item.rowIndex
        ].propertyValue as number;
      }
      triggerConditions.value[item.groupIndex].parameter[
        item.rowIndex
      ].editMode = false;
      emitTriggerConditions();
    } else {
      item.data.error = true;
      triggerConditions.value[item.groupIndex].parameter[
        item.rowIndex
      ].editMode = true;
    }
  }

  function addRow(item: InterventionTriggerUpdateItem) {
    setEditModeFalse();
    triggerConditions.value[item.groupIndex].parameter.push({
      observationId: undefined,
      observationType: '',
      observationProperty: '',
      operator: '',
      propertyValue: '',
      editMode: true,
    });
  }
  function deleteRow(item: InterventionTriggerUpdateItem) {
    triggerConditions.value[item.groupIndex].parameter.splice(item.rowIndex, 1);
    triggerConditions.value.forEach((item, index) => {
      if (!item.parameter.length) {
        triggerConditions.value.splice(index, 1);
      }
    });
  }

  function changeGroupCondition(item: GroupConditionChange) {
    triggerConditions.value[item.groupIndex].nextGroupCondition = item.value;
    emitTriggerConditions();
  }
</script>

<template>
  <div class="intervention-trigger-conditions">
    <h5 class="mb-1">
      {{ $t('intervention.dialog.label.triggerConditions') }}
    </h5>
    <div>{{ $t('intervention.dialog.label.triggerConditionsDesc') }}</div>

    <Suspense>
      <div
        v-if="!triggerConditions.length"
        class="mt-6 mb-6 w-full text-center"
      >
        <Button
          type="button"
          class="p-button mt-6 mb-6"
          @click="addTriggerGroup()"
          >+ Add Trigger Group</Button
        >
      </div>

      <InterventionTriggerConditionTable
        v-for="(condition, index) in triggerConditions"
        v-else
        :key="index"
        :rows="condition.parameter"
        :group-index="index as number"
        :next-group-condition="
          condition.nextGroupCondition ? condition.nextGroupCondition : ''
        "
        :study-id="studyStore.study.studyId as number"
        :columns="triggerConditionColumns"
        class="mt-6"
        @on-add-trigger-group="addTriggerGroup($event)"
        @on-toggle-row-edit="toggleRowEdit($event)"
        @on-update-row-data="updateRowData($event)"
        @on-delete-row="deleteRow($event)"
        @on-add-row="addRow($event)"
        @on-change-group-condition="changeGroupCondition($event)"
      />
    </Suspense>
  </div>
</template>

<style scoped lang="postcss"></style>

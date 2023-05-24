<script setup lang="ts">
  import { MoreTableColumn } from '../../models/MoreTableModel';
  import InterventionTriggerConditionTable from './InterventionTriggerConditionTable.vue';
  import { ref, Ref } from 'vue';
  import {
    GroupConditionChange,
    InterventionTriggerUpdateData,
    InterventionTriggerUpdateItem,
    TriggerConditionGroup,
  } from '../../models/InterventionTriggerModel';
  import { useStudyStore } from '../../stores/studyStore';
  const studyStore = useStudyStore();

  const triggerConditionTest: TriggerConditionGroup[] = [
    {
      nextGroupCondition: 'or',
      parameter: [
        {
          observationId: 17,
          observationTitle: 'ACC TEST',
          observationType: 'acc-mobile-observation',
          observationProperty: 'x',
          operator: '>',
          propertyValue: '75',
          editMode: false,
        },
        {
          observationId: 17,
          observationTitle: 'ACC TEST',
          observationType: 'acc-mobile-observation',
          observationProperty: 'y',
          operator: '=',
          propertyValue: '23',
          editMode: false,
        },
        {
          observationId: 17,
          observationTitle: 'ACC TEST',
          observationType: 'acc-mobile-observation',
          observationProperty: 'x',
          operator: '=',
          propertyValue: '23',
          editMode: false,
        },
      ],
    },
    {
      nextGroupCondition: null,
      parameter: [
        {
          observationId: 15,
          observationTitle: 'GPS TEST',
          observationType: 'gps-mobile-observation',
          observationProperty: 'lat',
          operator: '=',
          propertyValue: '47.807020',
          editMode: false,
        },
        {
          observationId: 15,
          observationTitle: 'GPS TEST',
          observationType: 'gps-mobile-observation',
          observationProperty: 'long',
          operator: '=',
          propertyValue: '13.046940',
          editMode: false,
        },
      ],
    },
  ];

  const triggerConditions: Ref<TriggerConditionGroup[]> =
    ref(triggerConditionTest);

  const triggerConditionColumns: Ref<MoreTableColumn[]> = ref([
    {
      field: 'observationTitle',
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

  console.log(triggerConditions.value);

  function addTriggerGroup(groupIndex: number) {
    setEditModeFalse();
    triggerConditions.value.push({
      nextGroupCondition: null,
      parameter: [
        {
          observationId: undefined,
          observationTitle: '',
          observationType: '',
          observationProperty: '',
          operator: '',
          propertyValue: '',
          editMode: true,
        },
      ],
    });
    triggerConditions.value[groupIndex].nextGroupCondition = 'and';
  }

  function setEditModeFalse() {
    triggerConditions.value.forEach((item: TriggerConditionGroup) =>
      item.parameter.forEach((param) => (param.editMode = false))
    );
  }

  function toggleRowEdit(item: InterventionTriggerUpdateItem) {
    setEditModeFalse();
    triggerConditions.value[item.groupIndex].parameter[item.rowIndex].editMode =
      item.edit || false;
  }
  function updateRowData(item: InterventionTriggerUpdateData) {
    triggerConditions.value[item.groupIndex].parameter[item.rowIndex] =
      item.data;
    triggerConditions.value[item.groupIndex].parameter[item.rowIndex].editMode =
      false;

    console.log(triggerConditions.value);
  }

  function addRow(item: InterventionTriggerUpdateItem) {
    console.log('addRow----');
    console.log(triggerConditions.value);
    triggerConditions.value[item.groupIndex].parameter.push({
      observationId: undefined,
      observationTitle: '',
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
  }
</script>

<template>
  <div class="intervention-trigger-conditions">
    <h5>{{ $t('intervention.dialog.label.triggerConditions') }}</h5>
    <div>{{ $t('intervention.dialog.label.triggerConditionsDesc') }}</div>

    <Suspense>
      <InterventionTriggerConditionTable
        v-for="(condition, index) in triggerConditions"
        :key="index"
        :rows="condition.parameter"
        :group-index="index as number"
        :next-group-condition="
          condition.nextGroupCondition ? condition.nextGroupCondition : ''
        "
        :study-id="studyStore.study.studyId as number"
        :columns="triggerConditionColumns"
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

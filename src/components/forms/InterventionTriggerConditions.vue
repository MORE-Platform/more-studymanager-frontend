<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { ComponentFactory, StudyRole } from '../../generated-sources/openapi';
  import { useComponentsApi } from '../../composable/useApi';
  import {
    MoreIntegrationTableMap,
    MoreTableAction,
    MoreTableColumn,
    MoreTableFieldType,
  } from '../../models/MoreTableModel';
  import DeleteMoreTableRowDialog from '../dialog/DeleteMoreTableRowDialog.vue';
  import MoreTable from '../shared/MoreTable.vue';
  import useLoader from '../../composable/useLoader';
  import InterventionTriggerConditionTable from './InterventionTriggerConditionTable.vue';
  import { ref, Ref } from 'vue';
  import Dropdown from 'primevue/dropdown';
  import Button from 'primevue/button';

  const { componentsApi } = useComponentsApi();
  const { t } = useI18n();
  const loader = useLoader();

  const observationTypes: any = [
    {
      type: 'acc-mobile-observation',
      properties: ['x', 'y', 'z'],
    },
    {
      type: 'gps-mobile-observation',
      properties: ['long', 'lat', 'alt'],
    },
    {
      type: 'polar-verity-observation',
      properties: ['hr'],
    },
  ];

  const triggerConditionTest: any = [
    {
      nextGroupCondition: 'or',
      parameter: [
        {
          observationType: 'acc-mobile-observation',
          observationProperty: 'x',
          operator: '>',
          propertyValue: '75',
          editMode: false,
        },
        {
          observationType: 'acc-mobile-observation',
          observationProperty: 'y',
          operator: '=',
          propertyValue: '23',
          editMode: false,
        },
        {
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
          observationType: 'polar-verity-observation',
          observationProperty: 'bpm',
          operator: '>',
          propertyValue: '150',
          editMode: false,
        },
        {
          observationType: 'gps-mobile-observation',
          observationProperty: 'lat',
          operator: '=',
          propertyValue: '47.807020',
          editMode: false,
        },
        {
          observationType: 'gps-mobile-observation',
          observationProperty: 'long',
          operator: '=',
          propertyValue: '13.046940',
          editMode: false,
        },
      ],
    },
  ];

  const triggerConditions: Ref<any> = ref(triggerConditionTest);

  const triggerConditionColumns: Ref<MoreTableColumn[]> = ref([
    {
      field: 'observationType',
      header: 'Observation Property',
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

  function addTriggerGroup(groupIndex: number) {
    setEditModeFalse();
    triggerConditions.value.push({
      nextGroupCondition: undefined,
      parameter: [
        {
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
    triggerConditions.value.forEach((item: any) =>
      item.parameter.forEach((param) => (param.editMode = false))
    );
  }

  function toggleRowEdit(item: any) {
    setEditModeFalse();
    triggerConditions.value[item.groupIndex].parameter[item.rowIndex].editMode =
      item.edit;
  }
  function updateRowData(item: any) {
    triggerConditions.value[item.groupIndex].parameter[item.rowIndex] =
      item.data;
    triggerConditions.value[item.groupIndex].parameter[item.rowIndex].editMode =
      false;
  }

  function deleteRow(item: any) {
    triggerConditions.value[item.groupIndex].parameter.splice(item.rowIndex, 1);
    triggerConditions.value.forEach((item, index) => {
      if (!item.parameter.length) {
        triggerConditions.value.splice(index, 1);
      }
    });
  }
</script>

<template>
  <div class="intervention-trigger-conditions">
    <h5>{{ $t('intervention.dialog.label.triggerConditions') }}</h5>
    <div>{{ $t('intervention.dialog.label.triggerConditionsDesc') }}</div>

    <InterventionTriggerConditionTable
      v-for="(condition, index) in triggerConditions"
      :key="index"
      :rows="condition.parameter"
      :group-index="index as number"
      :next-group-condition="
        condition.nextGroupCondition ? condition.nextGroupCondition : ''
      "
      :columns="triggerConditionColumns"
      @on-add-trigger-group="addTriggerGroup($event)"
      @on-toggle-row-edit="toggleRowEdit($event)"
      @on-update-row-data="updateRowData($event)"
      @on-delete-row="deleteRow($event)"
    />
  </div>
</template>

<style scoped lang="postcss"></style>

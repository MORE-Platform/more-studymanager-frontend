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
        },
        {
          observationType: 'acc-mobile-observation',
          observationProperty: 'y',
          operator: '=',
          propertyValue: '23',
        },
        {
          observationType: 'acc-mobile-observation',
          observationProperty: 'x',
          operator: '=',
          propertyValue: '23',
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
        },
        {
          observationType: 'gps-mobile-observation',
          observationProperty: 'lat',
          operator: '=',
          propertyValue: '47.807020',
        },
        {
          observationType: 'gps-mobile-observation',
          observationProperty: 'long',
          operator: '=',
          propertyValue: '13.046940',
        },
      ],
    },
  ];

  const triggerConditions: Ref<any> = ref(triggerConditionTest);

  async function getFactories() {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }
  const factories: ComponentFactory[] = await getFactories();
  console.log(factories);

  const triggerConditionColumns: MoreTableColumn[] = [
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
  ];

  const rowActions: MoreTableAction[] = [
    {
      id: 'delete',
      label: t('global.labels.delete'),
      icon: 'pi pi-trash',
      visible: () => true,
    },
    {
      id: 'addCondition',
      label: 'Condition',
      icon: 'pi pi-plus',
      visible: () => true,
    },
  ];

  function execute(action: any) {
    switch (action.id) {
      case 'delete':
        return console.log('delete');
      case 'addConditions':
        return console.log('addConditions');
    }
  }

  function addTriggerGroup() {}
</script>

<template>
  <div class="intervention-trigger-conditions">
    <h5>{{ $t('intervention.dialog.label.triggerConditions') }}</h5>
    <div>{{ $t('intervention.dialog.label.triggerConditionsDesc') }}</div>

    <MoreTable
      row-id="observationType"
      :columns="triggerConditionColumns"
      :rows="triggerConditionTest[0].parameter"
      :row-actions="rowActions"
      :loading="loader.isLoading.value"
      :editable-access="true"
      :editable-user-roles="[StudyRole.Admin, StudyRole.Operator]"
      :empty-message="'Add trigger conditions'"
      @onaction="execute($event)"
    />

    <InterventionTriggerConditionTable
      v-for="(condition, index) in triggerConditions"
      :key="index"
      :rows="condition.parameter"
      :next-group-condition="
        condition.nextGroupCondition ? condition.nextGroupCondition : ''
      "
      :columns="triggerConditionColumns"
      @on-add-trigger-group="addTriggerGroup"
    />
  </div>
</template>

<style scoped lang="postcss"></style>

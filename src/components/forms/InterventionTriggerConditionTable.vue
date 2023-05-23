<script setup lang="ts">
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import { Ref, ref } from 'vue';
  import {
    MoreTableAction,
    MoreTableActionOption,
    MoreTableChoice,
    MoreTableChoiceOptions,
    MoreTableColumn,
    MoreTableEditableChoiceProperties,
    MoreTableFieldType,
    MoreTableSortOptions,
  } from '../../models/MoreTableModel';

  const props = defineProps({
    columns: {
      type: Array<any>,
      required: true,
    },
    rows: {
      type: Array<any>,
      required: true,
    },
    nextGroupCondition: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits<{
    (e: 'onAddTriggerGroup'): boolean;
  }>();

  console.log(props.nextGroupCondition)
  const conditionValue: Ref<string> = ref(props.nextGroupCondition);

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

  function addTriggerGroup() {
    emit('onAddTriggerGroup');
  }
</script>

<template>
  <div class="trigger-condition-row">
    <DataTable selection-mode="single" responsive-layout="scroll" :value="rows">
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :row-hover="true"
      >
        <template #body="{ data, field }">{{ data[field] }}</template>
        <template #editor="{ data, field }">{{ data[field] }}</template>
      </Column>
    </DataTable>

    <div class="mt-5">
      <Button
        v-if="!nextGroupCondition"
        type="button"
        class="p-button"
        @click="addTriggerGroup"
        >+ Add Trigger Group</Button
      >
      <Dropdown
        v-else
        v-model="conditionValue"
        :options="[
          { label: 'and', value: 'and' },
          { label: 'or', value: 'or' },
        ]"
        option-label="label"
        option-value="value"
        icon="pi pi-plus"
        placeholder="enter"
      />
    </div>
  </div>
</template>

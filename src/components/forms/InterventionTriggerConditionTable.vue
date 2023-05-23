<script setup lang="ts">
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import InputText from 'primevue/inputtext';
  import { onUpdated, Ref, ref } from 'vue';
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
  import { ComponentFactory } from '../../generated-sources/openapi';
  import { useComponentsApi } from '../../composable/useApi';

  const { componentsApi } = useComponentsApi();

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
    groupIndex: {
      type: Number,
      required: true,
    },
  });

  const conditionValue: Ref<string> = ref(props.nextGroupCondition);
  const editingRows: Ref<Array<any>> = ref([]);

  onUpdated(() => {
    if (props.nextGroupCondition !== conditionValue.value) {
      conditionValue.value = props.nextGroupCondition;
    }
  });

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

  async function getFactories() {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }
  const factories: ComponentFactory[] = await getFactories();

  const emit = defineEmits<{
    (e: 'onAddTriggerGroup', groupIndex: number): void;
    (e: 'onToggleRowEdit', event: any): void;
    (e: 'onUpdateRowData', event: any): void;
    (e: 'onDeleteRow', event: any): void;
  }>();

  function getPropertyOptions(row: any): MoreTableChoice[] {
    console.log(row);
    return (
      observationTypes
        .find((item) => item.type === row.observationType)
        .properties.map((p: string) => ({ label: p, value: p })) || []
    );
  }

  function getObservationTypes(): MoreTableChoice[] {
    console.log('getObservationTypes------------');

    return (
      observationTypes.map((item) => ({
        label: factories.find((o) => o.componentId === item.type)?.title,
        value: item.type,
      })) || []
    );
  }

  function addTriggerGroup() {
    emit('onAddTriggerGroup', props.groupIndex);
  }

  function changeObservationType(row: any, index: number) {
    console.log(row);
    row.parameter.observationProperty = getPropertyOptions(row);
  }

  function edit(row: any, index: number) {
    emit('onToggleRowEdit', {
      edit: true,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
    editingRows.value = [];
    editingRows.value.push(row);
  }

  function cancel(row: any, index: number) {
    emit('onToggleRowEdit', {
      edit: false,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
    editingRows.value = [];
  }

  function save(row: any, index: number) {
    emit('onUpdateRowData', {
      data: row,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
  }

  function deleteRow(index: number) {
    emit('onDeleteRow', {
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
  }
</script>

<template>
  <div class="trigger-condition-row">
    <DataTable
      v-model:editingRows="editingRows"
      selection-mode="single"
      responsive-layout="scroll"
      :value="rows"
      edit-mode="row"
      table-class="editable-cells-table"
      @cell-edit-complete="console.log('completed')"
    >
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :row-hover="true"
      >
        <template #body="{ data, field }">{{ data[field] }}</template>
        <template #editor="slotProps">
          <div v-if="column.field === 'observationType'">
            <Dropdown
              v-model="slotProps.data[slotProps.field]"
              :options="getObservationTypes()"
              option-label="label"
              option-value="value"
              @change="changeObservationType(slotProps.data, slotProps.index)"
            />
          </div>
          <div v-else-if="column.field === 'observationProperty'">
            <Dropdown
              v-if="slotProps.data.observationType"
              v-model="slotProps.data[slotProps.field]"
              :options="getPropertyOptions(slotProps.data)"
              option-label="label"
              option-value="value"
            />
            <div v-else>Choose Observation Type</div>
          </div>
          <div v-else-if="column.field === 'operator'">
            <Dropdown
              v-model="slotProps.data[slotProps.field]"
              :options="[
                { label: '<', value: '<' },
                { label: '>', value: '>' },
                { label: '<=', value: '<=' },
                { label: '>=', value: '>=' },
                { label: '==', value: '==' },
                { label: '!=', value: '>=' },
              ]"
              option-label="label"
              option-value="value"
            />
          </div>
          <InputText v-else v-model="slotProps.data[slotProps.field]">{{
            slotProps.data[slotProps.field]
          }}</InputText>
        </template>
      </Column>
      <Column key="action" row-hover="true" class="row-action">
        <template #body="slotProps">
          <div v-if="!slotProps.data.editMode">
            <Button
              type="button"
              icon="pi pi-trash"
              class="btn-important"
              @click="deleteRow(slotProps.index)"
            />
            <span class="mr-1.5"></span>
            <Button
              type="button"
              icon="pi pi-pencil"
              @click="edit(slotProps.data, slotProps.index)"
            >
            </Button>
          </div>
          <div v-else-if="slotProps.data.editMode">
            <Button
              type="button"
              icon="pi pi-check"
              @click="save(slotProps.data, slotProps.index)"
            ></Button>
            <span class="mr-1.5"></span>
            <Button
              type="button"
              icon="pi pi-times"
              class="btn-gray"
              @click="cancel(slotProps.data, slotProps.index)"
            ></Button>
          </div>
        </template>
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

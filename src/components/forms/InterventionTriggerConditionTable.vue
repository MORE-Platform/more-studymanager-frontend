<script setup lang="ts">
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import { onMounted, onUpdated, Ref, ref, watch } from 'vue';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import {
    ComponentFactory,
    ComponentFactoryMeasurementsInner,
    Observation,
  } from '../../generated-sources/openapi';
  import {
    useComponentsApi,
    useObservationsApi,
  } from '../../composable/useApi';
  import {
    GroupConditionChange,
    InterventionChoice,
    InterventionTriggerConfig,
    InterventionTriggerUpdateData,
    InterventionTriggerUpdateItem,
  } from '../../models/InterventionTriggerModel';
  import { AxiosError, AxiosResponse } from 'axios/index';
  import { useErrorHandling } from '../../composable/useErrorHandling';

  const { observationsApi } = useObservationsApi();
  const { componentsApi } = useComponentsApi();
  const { handleIndividualError } = useErrorHandling();

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
    studyId: {
      type: Number,
      required: true,
    },
  });

  watch(props.rows, () => {
    editingRows.value = [];

    props.rows.forEach((item) => {
      if (item.editMode) {
        editingRows.value.push(item);
      }
    });
  });

  const conditionValue: Ref<string> = ref(props.nextGroupCondition);
  const editingRows: Ref<Array<any>> = ref([]);
  const observationList: Ref<Observation[]> = ref([]);

  async function getObservationList(): Promise<void> {
    await observationsApi
      .listObservations(props.studyId)
      .then((response: AxiosResponse) => {
        observationList.value = response.data;
      })
      .catch((e: AxiosError) =>
        handleIndividualError(e, 'cannot list observations')
      );
  }
  await getObservationList();

  const observationValues: InterventionChoice[] =
    observationList.value.map((o) => ({
      label: o.title as string,
      value: o.observationId as number,
    })) || [];

  onUpdated(() => {
    if (props.nextGroupCondition !== conditionValue.value) {
      conditionValue.value = props.nextGroupCondition;
    }
  });

  onMounted(() => {
    editingRows.value = [];

    props.rows.forEach((item) => {
      if (item.editMode) {
        editingRows.value.push(item);
      }
    });
  });

  const numericOperator: MoreTableChoice[] = [
    { label: '<', value: '<' },
    { label: '>', value: '>' },
    { label: '<=', value: '<=' },
    { label: '>=', value: '>=' },
    { label: '=', value: '=' },
    { label: '!', value: '!' },
  ];

  const stringOperator: MoreTableChoice[] = [
    { label: '=', value: '=' },
    { label: '!', value: '!' },
  ];

  async function getFactories() {
    return componentsApi
      .listComponents('observation')
      .then((response: any) => response.data);
  }
  const factories: ComponentFactory[] = await getFactories();

  const emit = defineEmits<{
    (e: 'onAddTriggerGroup', groupIndex: number): void;
    (e: 'onToggleRowEdit', event: InterventionTriggerUpdateItem): void;
    (e: 'onUpdateRowData', event: InterventionTriggerUpdateData): void;
    (e: 'onDeleteRow', event: InterventionTriggerUpdateItem): void;
    (e: 'onAddRow', event: InterventionTriggerUpdateItem): void;
    (e: 'onChangeGroupCondition', event: GroupConditionChange): void;
  }>();

  function getPropertyOptions(
    trigger: InterventionTriggerConfig
  ): ComponentFactoryMeasurementsInner[] {
    if (trigger.observationType) {
      return (
        factories.find(
          (o: ComponentFactory) => o.componentId === trigger.observationType
        )?.measurements || []
      );
    }
    return [];
  }

  function getOperatorOptions(trigger: InterventionTriggerConfig) {
    const operator: ComponentFactoryMeasurementsInner = getOperator(trigger);
    return operator.type === 'DOUBLE' ? numericOperator : stringOperator || [];
  }

  function getOperator(
    trigger: InterventionTriggerConfig
  ): ComponentFactoryMeasurementsInner {
    return getPropertyOptions(trigger).find(
      (item) => item.id === trigger.observationProperty
    ) as ComponentFactoryMeasurementsInner;
  }

  function updateEditRows() {
    props.rows.forEach((item: InterventionTriggerConfig) => {
      if (item.editMode) {
        editingRows.value.push(item);
      }
    });
  }

  function changeObservationType(trigger: InterventionTriggerConfig) {
    if (trigger.observationId) {
      const observation = findObservationById(
        trigger.observationId
      ) as Observation;

      trigger.observationType = observation.type as string;

      const propertyOptions: ComponentFactoryMeasurementsInner[] =
        getPropertyOptions(trigger);

      trigger.observationProperty = propertyOptions[0].id || '';
      trigger.operator = propertyOptions[0].id
        ? propertyOptions[0].type === 'DOUBLE'
          ? (numericOperator[0].value as string)
          : (stringOperator[0].value as string)
        : '';

      trigger.propertyValue = '';
    }
  }

  function getObservationTitle(observationId: number): string {
    return (
      observationList.value.find(
        (item) => (item.observationId as number) === observationId
      )?.title || ''
    );
  }

  function findObservationById(observationId: number): Observation {
    return (
      observationList.value.find(
        (o) => (o.observationId as number) === observationId
      ) || {}
    );
  }

  function changeNextGroupCondition() {
    emit('onChangeGroupCondition', {
      groupIndex: props.groupIndex,
      value: conditionValue.value,
    });
  }

  function edit(trigger: InterventionTriggerConfig, index: number) {
    emit('onToggleRowEdit', {
      edit: true,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
    editingRows.value = [];
    editingRows.value.push(trigger);
  }

  function cancel(trigger: InterventionTriggerConfig, index: number) {
    emit('onToggleRowEdit', {
      data: trigger,
      edit: false,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
    editingRows.value = [];
  }

  function save(trigger: InterventionTriggerConfig, index: number) {
    emit('onUpdateRowData', {
      data: trigger,
      groupIndex: props.groupIndex,
      rowIndex: index,
    });
  }

  function addRow(index: number) {
    emit('onAddRow', {
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

  function addTriggerGroup() {
    emit('onAddTriggerGroup', props.groupIndex);
    updateEditRows();
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
    >
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :row-hover="true"
      >
        <template #body="{ data, field }">
          <span v-if="field === 'observationId'">
            <span v-if="data[field] === undefined"> Choose Observation </span>
            <span v-else>
              {{ getObservationTitle(data[field]) }}
            </span>
          </span>
          <span v-else>
            {{ data[field] }}
          </span>
        </template>
        <template #editor="{ data, field }">
          <Dropdown
            v-if="field === 'observationId'"
            v-model="data[field]"
            :options="observationValues"
            option-label="label"
            option-value="value"
            placeholder="Select observation"
            :filter="true"
            @change="changeObservationType(data)"
          />
          <div v-else-if="data['observationId'] === undefined">-</div>
          <Dropdown
            v-else-if="
              column.field === 'observationProperty' &&
              data['observationType'] !== 'external-observation'
            "
            v-model="data[field]"
            :options="getPropertyOptions(data)"
            option-label="id"
            option-value="id"
          />
          <Dropdown
            v-else-if="column.field === 'operator' && data['observationType']"
            v-model="data[field]"
            :options="getOperatorOptions(data)"
            option-label="label"
            option-value="value"
          />
          <InputNumber
            v-else-if="
              getOperator(data).type === 'DOUBLE' &&
              data['observationType'] !== 'gps-mobile-observation'
            "
            v-model="data[field]"
            placeholder="Enter number"
          />
          <InputText v-else v-model="data[field]" placeholder="Enter value">
            {{ data[field] }}
          </InputText>
        </template>
      </Column>
      <Column key="action" row-hover="true" class="row-action text-end">
        <template #body="slotProps">
          <div v-if="!slotProps.data.editMode" class="text-end">
            <div v-if="slotProps.index + 1 < rows.length" class="inline p-5">
              &
            </div>
            <Button
              v-else
              type="button"
              icon="pi pi-plus"
              class="p-button p-3"
              @click="addRow(slotProps.index)"
            ></Button>
            <span class="mr-1.5"></span>
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
          <div v-else-if="slotProps.data.editMode" class="text-end">
            <div v-if="slotProps.data.error" class="error inline p-5">
              <span
                class="pi pi-exclamation-circle"
                style="font-size: 2rem"
              ></span>
            </div>
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
    <div class="mt-5 text-center">
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
        @change="changeNextGroupCondition()"
      />
    </div>
  </div>
</template>

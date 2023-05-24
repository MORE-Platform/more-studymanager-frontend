<script setup lang="ts">
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dropdown from 'primevue/dropdown';
  import InputText from 'primevue/inputtext';
  import { onUpdated, Ref, ref } from 'vue';
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

  const observationValues: MoreTableChoice[] =
    observationList.value.map((o) => ({
      label: o.title as string,
      value: (o.observationId as number).toString(),
    })) || [];

  onUpdated(() => {
    if (props.nextGroupCondition !== conditionValue.value) {
      conditionValue.value = props.nextGroupCondition;

      editingRows.value = [];
      props.rows.forEach((item: InterventionTriggerConfig) => {
        if (item.editMode) {
          editingRows.value.push(item);
        }
      });
    }
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
    { label: '==', value: '==' },
    { label: '!=', value: '!=' },
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
    return (
      factories.find(
        (o: ComponentFactory) => o.componentId === trigger.observationType
      )?.measurements || []
    );
  }

  function getOperatorOptions(trigger: InterventionTriggerConfig) {
    return getPropertyOptions(trigger)[0].type === 'DOUBLE'
      ? numericOperator
      : stringOperator;
  }
  function getAnswerOptions(trigger: InterventionTriggerConfig) {
    trigger.propertyValue = '';
    return (
      observationList.value
        .find(
          (o: Observation) =>
            o.observationId?.toString() === trigger.observationId?.toString()
        )
        //@ts-ignore
        ?.properties?.answers.map((a: string) => ({ label: a, value: a })) || []
    );
  }

  function updateEditRows() {
    props.rows.forEach((item: InterventionTriggerConfig) => {
      if (item.editMode) {
        editingRows.value.push(item);
      }
    });
  }

  function changeObservationType(trigger: InterventionTriggerConfig) {
    const observation = findObservationById(
      (trigger.observationId as number).toString()
    ) as Observation;

    trigger.observationType = observation.type as string;
    trigger.observationTitle = observation.title as string;

    trigger.observationProperty =
      getPropertyOptions(trigger)[0].id || 'no measurement';
  }

  function findObservationById(observationId: string): Observation {
    return (
      observationList.value.find(
        (o) => o.observationId?.toString() === observationId
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

  function cancel(index: number) {
    emit('onToggleRowEdit', {
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
    console.log('addRow');
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
        <template #body="{ data, field }">{{ data[field] }} </template>
        <template #editor="slotProps">
          <div v-if="column.field === 'observationTitle'">
            <Dropdown
              v-model="slotProps.data['observationId']"
              :options="observationValues"
              option-label="label"
              option-value="value"
              :placeholder="
                slotProps.data[slotProps.field]
                  ? slotProps.data[slotProps.field]
                  : 'Select observation'
              "
              @change="changeObservationType(slotProps.data)"
            />
          </div>
          <div v-else-if="column.field === 'observationProperty'">
            <Dropdown
              v-if="slotProps.data.observationType"
              v-model="slotProps.data[slotProps.field]"
              :options="getPropertyOptions(slotProps.data)"
              option-label="id"
              option-value="id"
            />
            <div v-else>Choose Observation Type</div>
          </div>
          <div v-else-if="column.field === 'operator'">
            <Dropdown
              v-model="slotProps.data[slotProps.field]"
              :options="getOperatorOptions(slotProps.data)"
              option-label="label"
              option-value="value"
            />
          </div>
          <div
            v-else-if="
              column.field === 'propertyValue' &&
              slotProps.data.observationType === 'question-observation'
            "
          >
            <Dropdown
              v-model="slotProps.data[slotProps.field]"
              :options="getAnswerOptions(slotProps.data)"
              option-label="label"
              option-value="value"
            />
          </div>
          <InputText v-else v-model="slotProps.data[slotProps.field]">{{
            slotProps.data[slotProps.field]
          }}</InputText>
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
              @click="cancel(slotProps.index)"
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
        @change="changeNextGroupCondition()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onBeforeMount, PropType, ref} from 'vue'
import {
  MoreTableColumn,
  MoreTableAction,
  MoreTableActionResult,
  MoreTableRowEditResult, MoreTableSortOptions
} from '../../models/MoreTableModel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import {useConfirm} from 'primevue/useconfirm';
import {MoreTableEditableType} from '../../models/MoreTableModel'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  rowId: {
    type: String,
    required: true,
  },
  columns: {
    type: Array as PropType<Array<MoreTableColumn>>,
    required: true,
  },
  rows: {
    type: Array as PropType<Array<unknown>>,
    required: true,
  },
  rowActions: {
    type: Array as PropType<Array<MoreTableAction>>,
    default: () => [],
  },
  tableActions: {
    type: Array as PropType<Array<MoreTableAction>>,
    default: () => [],
  } ,
  useFilters: {
    type: Boolean,
    default: false
  },
  sortOptions: {
    type: Object as PropType <MoreTableSortOptions>,
    default:  () => undefined
  }
})

const editable = ref(false);
onBeforeMount(() => {
  editable.value = !!props.columns.find(c => c.editable)
})

const confirm = useConfirm();

const editingRows = ref([]);
const editMode = ref(false);

const emit = defineEmits<{
  (e: 'onselect', rowKey: string): void
  (e: 'onaction', result: MoreTableActionResult<unknown>): void
  (e: 'onchange', value: MoreTableRowEditResult): void
}>()

function selectHandler(rowKey: string) {
  emit('onselect', rowKey)
}

function actionHandler(action: MoreTableAction, data: unknown) {
  if(action.confirm) {
    confirm.require({
      header: action.confirm.header,
      message: action.confirm.message,
      accept: () => {
        emit('onaction', {id: action.id, data})
      }
    });
  } else {
    emit('onaction', {id: action.id, data})
  }

}

function edit(row: unknown) {
  editMode.value = true;
  editingRows.value.push(row);
}

function cancel(row: any) {
  editingRows.value.splice(editingRows.value.findIndex(r => r[props.rowId] === row[props.rowId]));
  editMode.value = false;
}

function save(row:any) {
  emit('onchange', {rowId: row[props.rowId], data: row})
  cancel(row);
}

</script>

<template>
  <div>
    <h3>{{ title }}</h3>
    <DataTable
      v-model:editingRows="editingRows"
      :value="rows"
      :sort-field="sortOptions.sortField"
      :sort-order="sortOptions.sortOrder"
      :edit-mode="editable ? 'row' : undefined"
      selection-mode="single"
      responsive-layout="scroll"
      @row-click="selectHandler($event.data[rowId])"
    >

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="$t(column.header)"
        :data-key="column.field"
        :row-hover="true"
        :sortable="column.sortable"

      >
        <template #editor="{ data, field }" v-if="column.editable">
          <InputText v-if="column.editable.type === MoreTableEditableType.string" v-model="data[field]" autofocus />
          <Calendar v-if="column.editable.type === MoreTableEditableType.calendar" inputId="dateformat" v-model="data[field]" autocomplete="off" dateFormat="mm-dd-yy"/>
        </template>
        <template #body="{ data, field }" v-else>
          {{data[field]}}
        </template>
      </Column>

      <Column
        key="actions"
        :header="$t('actions')"
        :row-hover="true"
        class="row-actions"
      >
        <template #body="slotProps">
          <Button v-if="!editMode" v-for="action in rowActions" type="button" :title="action.label" :icon="action.icon" @click="actionHandler(action, slotProps.data)"></Button>
          <Button v-if="!editMode" type="button" icon="pi pi-pencil" @click="edit(slotProps.data)"></Button>
          <Button v-if="editMode" type="button" icon="pi pi-check" @click="save(slotProps.data)"></Button>
          <Button v-if="editMode" type="button" icon="pi pi-times" @click="cancel(slotProps.data)"></Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style lang="postcss">
  .row-actions {
    button {
      margin: 0 3px
    }
  }
</style>

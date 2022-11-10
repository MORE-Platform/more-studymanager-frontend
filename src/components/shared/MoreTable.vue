<script setup lang="ts">
import {onBeforeMount, PropType, ref} from 'vue'
import {
  MoreTableColumn,
  MoreTableAction,
  MoreTableSortOptions,
  MoreTableRowActionResult
} from '../../models/MoreTableModel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import {useConfirm} from 'primevue/useconfirm';
import {MoreTableFieldType} from '../../models/MoreTableModel'

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
    default:  () => undefined,
  }
})

const editable = ref(false);
onBeforeMount(() => {
  editable.value = !!props.columns.find(c => c.editable)
})

const confirm = useConfirm();

const editingRows = ref([]);
const editMode = ref([]);

const emit = defineEmits<{
  (e: 'onselect', row: unknown): void
  (e: 'onaction', result: MoreTableRowActionResult<unknown>): void
  (e: 'onchange', row: unknown): void
}>()

function selectHandler(rowKey: string) {
  emit('onselect', rowKey)
}

function rowActionHandler(action: MoreTableAction, row: unknown) {
  if(action.confirm) {
    confirm.require({
      header: action.confirm.header,
      message: action.confirm.message,
      accept: () => {
        emit('onaction', {id: action.id, row})
      }
    });
  } else {
    emit('onaction', {id: action.id, row})
  }

}

function isEditMode(row:unknown) {
  return editMode.value.includes(row[props.rowId])
}

function edit(row: unknown) {
  editMode.value.push(row[props.rowId]);
  editingRows.value.push(row);
}

function cancel(row: unknown) {
  editingRows.value.splice(editingRows.value.findIndex(r => r[props.rowId] === row[props.rowId]));
  editMode.value.splice(editMode.value.findIndex(r => r === row[props.rowId]));
}

function save(row: unknown) {
  emit('onchange', row)
  cancel(row);
}

</script>

<template>
  <div>
    <h3>{{ title }}</h3>
    <DataTable
      v-model:editingRows="editingRows"
      :value="rows"
      :sort-field="sortOptions?.sortField"
      :sort-order="sortOptions?.sortOrder"
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
        <template v-if="column.editable" #editor="{ data, field }">
          <InputText v-if="!column.type || column.type === MoreTableFieldType.string" v-model="data[field]" autofocus />
          <Calendar v-if="column.type === MoreTableFieldType.calendar" v-model="data[field]" input-id="dateformat" autocomplete="off" date-format="mm-dd-yy"/>
        </template>
        <template v-else #body="{ data, field }">
          <span v-if="!column.type || column.type === MoreTableFieldType.string">{{data[field]}}</span>
          <span v-if="column.type === MoreTableFieldType.calendar">{{data[field]}}</span>
        </template>
      </Column>

      <Column
        key="actions"
        :header="$t('actions')"
        :row-hover="true"
        class="row-actions"
      >
        <template #body="slotProps">
          <div v-if="!isEditMode(slotProps.data)">
            <Button v-for="action in rowActions" :key="action.id" type="button" :title="action.label" :icon="action.icon" @click="rowActionHandler(action, slotProps.data)"></Button>
            <Button type="button" icon="pi pi-pencil" @click="edit(slotProps.data)"></Button>
          </div>
          <div v-else>
            <Button v-if="isEditMode(slotProps.data)" type="button" icon="pi pi-check" @click="save(slotProps.data)"></Button>
            <Button v-if="isEditMode(slotProps.data)" type="button" icon="pi pi-times" @click="cancel(slotProps.data)"></Button>
          </div>
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

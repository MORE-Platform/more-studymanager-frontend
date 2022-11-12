<script setup lang="ts">
import {onBeforeMount, PropType, Ref, ref} from 'vue'
import {
  MoreTableColumn,
  MoreTableAction,
  MoreTableSortOptions,
  MoreTableRowActionResult, MoreTableActionResult
} from '../../models/MoreTableModel'
import DataTable, {DataTableFilterMeta} from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import ProgressSpinner from 'primevue/progressspinner';
import {useConfirm} from 'primevue/useconfirm';
import * as dayjs from 'dayjs'
import {MoreTableFieldType} from '../../models/MoreTableModel'
import {FilterMatchMode} from 'primevue/api';
import {dateToDateString} from '../../utils/dateUtils';

const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  subtitle: {
    type: String,
    default: undefined,
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
  sortOptions: {
    type: Object as PropType <MoreTableSortOptions>,
    default:  () => undefined,
  },
  emptyMessage: {
    type: String,
    default: 'No records',
  },
  loading: {
    type: Boolean,
    default: false,
  }
})

const tableFilter = createTableFilter();

function createTableFilter(): Ref<DataTableFilterMeta> {
  const filterObject = {} as DataTableFilterMeta;
  props.columns.forEach(column => {
    if(column.filterable) {
      filterObject[column.field] = {value: null, matchMode: FilterMatchMode.CONTAINS};
    }
  })
   return ref(filterObject)
}

function filterMatchMode(column: MoreTableColumn): boolean {
    if (typeof column.filterable ==="object" && column.filterable !== undefined) {
    return column.filterable.showFilterMatchModes as boolean
   } else {
     return false;
   }
}

const editable = ref(false);
onBeforeMount(() => {
  editable.value = !!props.columns.find(c => c.editable)
})

const confirm = useConfirm();

const editingRows = ref([]);
const editMode = ref([]);

const emit = defineEmits<{
  (e: 'onselect', row: unknown): void
  (e: 'onaction', result: MoreTableRowActionResult<unknown>|MoreTableActionResult): void
  (e: 'onchange', row: unknown): void
}>()

function selectHandler(rowKey: string) {
  emit('onselect', rowKey)
}

function actionHandler(action: MoreTableAction) {
  emit('onaction', {id: action.id})
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

function isEditMode(row:any) {
  // @ts-expect-error: cannot really fix
  return editMode.value.includes(row[props.rowId])
}

function edit(row: any) {
  // @ts-expect-error: cannot really fix
  editMode.value.push(row[props.rowId]);

  // @ts-expect-error: cannot really fix
  editingRows.value.push(row);
}

function cancel(row: any) {
  editingRows.value.splice(editingRows.value.findIndex(r => r[props.rowId] === row[props.rowId]));
  editMode.value.splice(editMode.value.findIndex(r => r === row[props.rowId]));
}

function save(row: unknown) {
  emit('onchange', clean(row))
  cancel(row);
}

function prepare(rows:any) {
  return rows.map((row:any) => {
    props.columns.forEach(column => {
      if(column.type === MoreTableFieldType.calendar) {
        row['__internalValue_' + column.field] = column.field ? new Date(row[column.field]) : undefined;
      }
    })
    return row;
  });
}

function clean(row:any) {
  props.columns.forEach(column => {
    if(column.type === MoreTableFieldType.calendar) {
      const date = row['__internalValue_' + column.field];
      row[column.field] = dateToDateString(date)
      delete row['__internalValue_' + column.field];
    }
  })
  return row;
}
</script>

<template>
  <div class="more-table">
    <div class="flex mb-8">
      <div class="title">
        <h3 v-if="title">{{ title }}</h3>
        <h4 v-if="subtitle">{{subtitle}}</h4>
      </div>
      <div class="actions flex flex-1 justify-end">
        <Button v-for="action in tableActions" :key="action.id" type="button" :label="action.label" :icon="action.icon" @click="actionHandler(action)"></Button>
      </div>
    </div>

    <DataTable
      v-model:editingRows="editingRows"
      v-model:filters="tableFilter"
      :value="prepare(rows)"
      :sort-field="sortOptions?.sortField"
      :sort-order="sortOptions?.sortOrder"
      :edit-mode="editable ? 'row' : undefined"
      :loading="loading"
      filter-display="menu"
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
        :filter="tableFilter"
        :show-filter-match-modes="filterMatchMode(column)"
      >
        <template v-if="column.editable" #editor="{ data, field }">
          <InputText style="width:100%" v-if="column.type === undefined || column.type === MoreTableFieldType.string" v-model="data[field]" autofocus />
          <Calendar style="width:100%" v-if="column.type === MoreTableFieldType.calendar" v-model="data['__internalValue_' + field]" input-id="dateformat" autocomplete="off" date-format="dd/mm/yy"/>
        </template>
        <template v-if="column.filterable" #filter="{filterModel,filterCallback}">
          <InputText  v-model="filterModel.value" type="text"  class="p-column-filter" :placeholder="`Search by name - ${filterModel.matchMode}`" @keydown.enter="filterCallback()"/>
        </template>
        <template v-else #body="{ data, field }">
          <span v-if="!column.type || column.type === MoreTableFieldType.string">{{data[field]}}</span>
          <span v-if="column.type === MoreTableFieldType.calendar">{{dayjs(data['__internalValue_' + field]).format('DD/MM/YYYY')}}</span>
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
      <template #empty>
        {{ emptyMessage }}
      </template>
      <template #loading>
        <ProgressSpinner />
      </template>
    </DataTable>
  </div>
</template>

<style lang="postcss">

  .more-table {
    h3 {
      color: var(--primary-color);
      font-weight: 600;
    }

    h4 {
      font-weight: 300;
    }
    .row-actions {
      button {
        margin: 0 3px
      }
    }

    .actions {
      button {
        margin-left: 10px;
      }
    }

    tr td:last-child {
      width: 1%;
      white-space: nowrap;
    }

    .p-datatable-loading-overlay {
      background-color: transparent;
    }
  }
</style>

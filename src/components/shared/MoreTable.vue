<script setup lang="ts">
import {onBeforeMount, PropType, Ref, ref} from 'vue'
import {
  MoreTableColumn,
  MoreTableAction,
  MoreTableSortOptions,
  MoreTableRowActionResult,
  MoreTableActionResult,
  MoreTableChoice
} from '../../models/MoreTableModel'
import DataTable, {DataTableFilterMeta} from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import SplitButton from 'primevue/splitbutton'
import Menu from 'primevue/menu'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from "primevue/dropdown";
//import MultiSelect from 'primevue/multiselect';
import ProgressSpinner from 'primevue/progressspinner';
import {useConfirm} from 'primevue/useconfirm';
import dayjs from 'dayjs'
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
    type: Array as PropType<Array<any>>,
    required: true,
  },
  rowActions: {
    type: Array as PropType<Array<MoreTableAction>>,
    default: () => [],
  },
  frontRowActions: {
    type: Array as PropType<Array<MoreTableAction>>,
    default: () => []
  },
  tableActions: {
    type: Array as PropType<Array<MoreTableAction>>,
    default: () => [],
  } ,
  sortOptions: {
    type: Object as PropType <MoreTableSortOptions>,
    default:  () => undefined,
  },
  editable: {
    type: Function,
    // eslint-disable-next-line
    default: (data:any) => true
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

const _editable = ref(false);
onBeforeMount(() => {
  _editable.value = !!props.columns.find(c => c.editable)
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

function actionHandler(action: MoreTableAction, properties?: any) {
  emit('onaction', {id: action.id, properties})
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

function isVisible(action: MoreTableAction, row: unknown = undefined) {
  return action.visible === undefined || action.visible(row);
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

function isEditable(row:any) {
  return props.editable(row);
}

function onRowClick($event: any) {
  if(editMode.value.length === 0) {
    selectHandler($event.data[props.rowId])
  }
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

const menus:any = {}
props.tableActions.forEach(action => {
  if(action.options) {
    action.options.values.forEach(option => {
      (option as any)['command'] = () => {actionHandler(action, option.value)}
    })
    if(action.options.type === 'menu') {
      menus[action.id] = ref()
    }
  }
})

function toggle(action:MoreTableAction, event:any) {
  menus[action.id].value[0].toggle(event)
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

function toClassName(value:string):string {
  if(value) {
    return value.toString().toLowerCase().replace(/\.|%[0-9a-z]{2}/gi, '');
  }
  return value;
}

function getLabelForChoiceValue(value: any, values: MoreTableChoice[]) {
  return values.find((s: any) => s.value === value.toString())?.label || value;
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
        <div v-for="action in tableActions" :key="action.id" class="action">
          <Button v-if="isVisible(action) && !action.options" type="button" :label="action.label" :icon="action.icon" @click="actionHandler(action)"></Button>
          <SplitButton v-if="isVisible(action) && !!action.options && action.options.type === 'split'" type="button" :label="action.label" :icon="action.icon" :model="action.options.values" @click="actionHandler(action)"></SplitButton>
          <div v-if="isVisible(action) && !!action.options && action.options.type === 'menu'">
            <Button  type="button" :label="action.label" :icon="action.icon" @click="toggle(action,$event)"></Button>
            <Menu :ref="menus[action.id]" :model="action.options.values" :popup="true" />
          </div>
        </div>
      </div>
    </div>

    <DataTable
      v-model:editingRows="editingRows"
      v-model:filters="tableFilter"
      :value="prepare(rows)"
      :sort-field="sortOptions?.sortField"
      :sort-order="sortOptions?.sortOrder"
      :edit-mode="_editable ? 'row' : undefined"
      :loading="loading"
      filter-display="menu"
      selection-mode="single"
      responsive-layout="scroll"
      @row-click="onRowClick($event)"
    >

      <Column
        v-if="frontRowActions.length"
        key="actions"
        :row-hover="true"
        class="row-actions"
      >
        <template #body="slotProps">
          <div v-for="action in frontRowActions" :key="action.id" class="inline">
            <Button v-if="isVisible(action, slotProps.data)" type="button" :title="action.label" :icon="action.icon" @click="rowActionHandler(action, slotProps.data) "></Button>
          </div>
        </template>

      </Column>

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
            <InputText v-if="!column.type || column.type ===MoreTableFieldType.string" v-model="data[field]" style="width:100%" autofocus />
            <Calendar v-if="column.type === MoreTableFieldType.calendar" v-model="data['__internalValue_' + field]" style="width:100%" input-id="dateformat" autocomplete="off" date-format="dd/mm/yy"/>
            <Dropdown
              v-if="column.type === MoreTableFieldType.choice" v-model="data[field]" :options="column.editable.values" option-label="label" option-value="value"></Dropdown>
            <!--<MultiSelect v-if="column.type === MoreTableFieldType.multiselect" v-model="data[field]" :options="column.choiceOptions.statuses" option-label="label" :placeholder="$t(column.choiceOptions.placeholder)"/>-->
        </template>
        <template v-if="column.filterable" #filter="{filterModel,filterCallback}">
          <InputText v-model="filterModel.value" type="text"  class="p-column-filter" :placeholder="`Search by name - ${filterModel.matchMode}`" @keydown.enter="filterCallback()"/>
        </template>
        <template #body="{ data, field }">
          <div v-if="data[field] === null" class="placeholder" >
            {{$t(column.placeholder || 'no-value')}}
          </div>
          <div v-else>
            <span v-if="!column.type || column.type === MoreTableFieldType.string" :class="'table-value table-value-' +field+'-'+ toClassName(data[field])">{{data[field]}}</span>
            <span v-if="column.type === MoreTableFieldType.choice">{{getLabelForChoiceValue(data[field], column.editable.values)}}</span>
            <span v-if="column.type === MoreTableFieldType.calendar">{{dayjs(data['__internalValue_' + field]).format('DD/MM/YYYY')}}</span>
          </div>
        </template>
      </Column>

      <Column
        key="actions"
        :row-hover="true"
        class="row-actions"
      >
        <template #body="slotProps">
          <div v-if="!isEditMode(slotProps.data)">
            <div v-for="action in rowActions" :key="action.id" class="inline">
              <Button v-if="isVisible(action, slotProps.data)" type="button" :title="action.label" :icon="action.icon" @click="rowActionHandler(action, slotProps.data) ">
                <span v-if="!action.icon">{{ action.label }}</span>
              </Button>
            </div>
            <Button v-if="isEditable(slotProps.data)" type="button" icon="pi pi-pencil" @click="edit(slotProps.data)">
            </Button>
          </div>
          <div v-else-if="isEditMode(slotProps.data)">
            <Button type="button" icon="pi pi-check" @click="save(slotProps.data)"></Button>
            <Button type="button" icon="pi pi-times" @click="cancel(slotProps.data)"></Button>
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
      font-weight: 600;
    }

    h4 {
      font-size: 1rem;
    }

    .row-actions {
      button {
        margin: 0 0.188rem;
      }
    }

    .actions {
      .action {
        margin-left: 0.625rem;
      }
    }

    table tbody tr {
      font-size: 0.906rem!important;

      td:last-child {
        width: 1%;
        white-space: nowrap;
      }
    }

    td.row-actions {
      justify-content: flex-end;
    }

    .placeholder {
      font-style: italic;
      color:#ccc
    }
  }
</style>

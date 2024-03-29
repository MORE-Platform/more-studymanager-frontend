/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { onBeforeMount, onUpdated, PropType, Ref, ref } from 'vue';
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
  import DataTable, { DataTableFilterMeta } from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import SplitButton from 'primevue/splitbutton';
  import Menu from 'primevue/menu';
  import InputText from 'primevue/inputtext';
  import Calendar from 'primevue/calendar';
  import Dropdown from 'primevue/dropdown';
  import MultiSelect from 'primevue/multiselect';
  import { useConfirm } from 'primevue/useconfirm';
  import FileUpload from 'primevue/fileupload';
  import dayjs from 'dayjs';
  import { FilterMatchMode } from 'primevue/api';
  import { dateToDateString } from '../../utils/dateUtils';
  import {
    ComponentFactory,
    StudyRole,
    StudyStatus,
  } from '../../generated-sources/openapi';
  import Checkbox from 'primevue/checkbox';

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
      default: () => [],
    },
    rowEndActions: {
      type: Array as PropType<Array<MoreTableAction>>,
      default: () => [],
    },
    tableActions: {
      type: Array as PropType<Array<MoreTableAction>>,
      default: () => [],
    },
    sortOptions: {
      type: Object as PropType<MoreTableSortOptions>,
      default: () => undefined,
    },
    editable: {
      type: Function,
      // eslint-disable-next-line
      default: (data: any) => true,
    },
    editableAccess: {
      type: Boolean,
      default: true,
    },
    rowEditBtn: {
      type: Boolean,
      default: true,
    },
    emptyMessage: {
      type: String,
      default: 'No records',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    editAccessRoles: {
      type: Array as PropType<Array<StudyRole>>,
      default: () => [],
    },
    userStudyRoles: {
      type: Array as PropType<Array<StudyRole>>,
      default: () => [],
    },
    paginator: {
      type: Boolean,
      default: false,
    },
    paginatorRows: {
      type: Number,
      default: 10,
    },
    rowTooltipMsg: {
      type: String,
      default: undefined,
    },
    rowEndIcon: {
      type: String,
      default: undefined,
    },
    componentFactory: {
      type: Array as PropType<Array<ComponentFactory>>,
      default: undefined,
    },
  });

  const tableFilter = createTableFilter();

  function createTableFilter(): Ref<DataTableFilterMeta> {
    const filterObject = {} as DataTableFilterMeta;
    props.columns.forEach((column) => {
      if (column.filterable) {
        filterObject[column.field] = {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        };
      }
    });
    return ref(filterObject);
  }

  function filterMatchMode(column: MoreTableColumn): boolean {
    if (
      typeof column.filterable === 'object' &&
      column.filterable !== undefined
    ) {
      return column.filterable.showFilterMatchModes as boolean;
    } else {
      return false;
    }
  }

  const _editable = ref(false);
  onBeforeMount(() => {
    if (props.editableAccess) {
      _editable.value = !!props.columns.find((c) => c.editable);
    }
  });
  onUpdated(() => {
    if (props.editableAccess) {
      _editable.value = !!props.columns.find((c) => c.editable);
    }
  });

  const confirm = useConfirm();

  const editingRows = ref([]);
  const editMode = ref([]);

  const emit = defineEmits<{
    (e: 'onselect', row: any): void;
    //use MoreTableRowActionResult<any> or MoreTableActionResult
    (e: 'onaction', result: any): void;
    (e: 'onchange', row: any): void;
  }>();

  function selectHandler(rowKey: string) {
    emit('onselect', rowKey);
  }

  function actionHandler(action: MoreTableAction, properties?: any) {
    emit('onaction', { id: action.id, properties });
  }

  function rowActionHandler(action: MoreTableAction, row: any) {
    if (action.confirm) {
      confirm.require({
        header: action.confirm.header,
        message: action.confirm.message,
        accept: () => {
          emit('onaction', { id: action.id, row });
        },
      });
    } else if (action.confirmDeleteDialog) {
      action.confirmDeleteDialog.dialog(row);
    } else {
      emit('onaction', { id: action.id, row });
    }
  }

  function isVisible(action: MoreTableAction, row: any = undefined) {
    return action.visible === undefined || action.visible(row);
  }

  function isEditMode(row: any) {
    if (row[props.rowId]) {
      // @ts-expect-error: cannot really fix
      return editMode.value.includes(row[props.rowId]);
    } else if (row.uid) {
      // @ts-expect-error: cannot really fix
      return editMode.value.includes(row.uid);
    }
  }

  function edit(row: any) {
    editMode.value = [];
    editingRows.value = [];

    if (row[props.rowId]) {
      // @ts-expect-error: cannot really fix
      editMode.value.push(row[props.rowId]);
    } else if (row.uid) {
      // @ts-expect-error: cannot really fix
      editMode.value.push(row.uid);
    }
    // @ts-expect-error: cannot really fix
    editingRows.value.push(row);
  }

  function cancel(row: any) {
    editingRows.value.splice(
      editingRows.value.findIndex((r) => r[props.rowId] === row[props.rowId])
    );
    editMode.value.splice(
      editMode.value.findIndex((r) => r === row[props.rowId])
    );
  }

  function save(row: any) {
    emit('onchange', clean(row));
    cancel(row);
  }
  function isEditable(row: any) {
    if (props.editableAccess) {
      if (row.userRoles) {
        return (
          (row.userRoles.some((r: StudyRole) =>
            props.editAccessRoles.includes(r)
          ) &&
            row.status === StudyStatus.Draft) ||
          (row.userRoles.some((r: StudyRole) =>
            props.editAccessRoles.includes(r)
          ) &&
            row.status === StudyStatus.Paused)
        );
      } else {
        return props.editable(row);
      }
    } else {
      return false;
    }
  }

  function onRowClick($event: any) {
    if (editMode.value.length === 0) {
      selectHandler($event.data[props.rowId]);
    }
  }

  function prepare(rows: any) {
    return rows.map((row: any) => {
      props.columns.forEach((column) => {
        if (column.type === MoreTableFieldType.calendar) {
          row['__internalValue_' + column.field] = column.field
            ? new Date(row[column.field])
            : undefined;
        }
      });
      return row;
    });
  }

  const menus: any = {};

  const searchActionsMap = ref(new Map<number, MoreTableActionOption[]>());

  props.tableActions.forEach((action, index) => {
    if (
      action.options &&
      action.options.values &&
      action.options.type !== 'fileUpload' &&
      action.options.type !== 'search'
    ) {
      action.options.values?.forEach((option) => {
        (option as any)['command'] = () => {
          actionHandler(action, option.value);
        };
      });
      if (action.options && action.options.type === 'menu') {
        menus[action.id] = ref();
      }
    } else if (action.options && action.options.type === 'fileUpload') {
      actionHandler(action, action.options?.uploadOptions);
    }

    if (
      action.options &&
      action.options.valuesCallback &&
      action.options.type === 'search'
    ) {
      searchActionsMap.value.set(index, action.options.values);
    }
  });

  function toggle(action: MoreTableAction, event: any) {
    menus[action.id].value[0].toggle(event);
  }

  function clean(row: any) {
    props.columns.forEach((column) => {
      if (column.type === MoreTableFieldType.calendar) {
        const date = row['__internalValue_' + column.field];
        row[column.field] = dateToDateString(date);
        delete row['__internalValue_' + column.field];
      }
    });
    return row;
  }

  function toClassName(value: string): string {
    if (value) {
      return value
        .toString()
        .toLowerCase()
        .replace(/\.|%[0-9a-z]{2}/gi, '');
    }
    return value;
  }

  function getLabelForChoiceValue(value: any, values: MoreTableChoice[]) {
    return (
      values.find((s: any) => s.value === value?.toString())?.label || value
    );
  }

  function getLabelForMultiSelectValue(
    setValues: any,
    valueChoices?: MoreTableChoice[]
  ) {
    if (valueChoices) {
      const labels: Ref<string[]> = ref([]);
      setValues.forEach((v: StudyRole) => {
        const valueLabel = valueChoices.find((vc) => vc.value === v);
        if (valueLabel) {
          labels.value.push(valueLabel.label);
        }
      });
      return labels.value;
    } else {
      return setValues.map((v: MoreTableChoice) => v.label);
    }
  }

  function shortenFieldText(text: string) {
    if (text) {
      if (text.length > 180) {
        return text.substring(0, 185) + '...';
      }
    } else {
      return undefined;
    }
    return text;
  }

  async function filterActionHandler(properties: any) {
    if (properties.query && properties.callback) {
      searchActionsMap.value.set(
        properties.index,
        await properties.callback(properties.query)
      );
    }
  }

  function isEditableWithValues(
    editable:
      | boolean
      | MoreTableChoiceOptions
      | MoreTableEditableChoiceProperties
      | ((data?: any) => boolean)
      | undefined
  ): MoreTableChoice[] {
    if (
      typeof editable !== 'undefined' &&
      typeof editable !== 'boolean' &&
      typeof editable !== 'function'
    ) {
      if (Object.prototype.hasOwnProperty.call(editable, 'values')) {
        const editableWithValues = editable as MoreTableChoiceOptions;
        return editableWithValues.values as MoreTableChoice[];
      }
    }

    return [] as MoreTableChoice[];
  }

  function getNestedField(data: any, field: string) {
    const f = field.split('.')[0];
    const p = field.split('.')[1];
    return data[f][p];
  }

  function getMoreTableChoiceValues(array: MoreTableChoiceOptions) {
    return array.values;
  }

  function getObservationVisibility(type?: string) {
    return props.componentFactory?.find((f) => f.componentId === type)
      ?.visibility;
  }
</script>

<template>
  <div class="more-table">
    <div class="mb-8 flex">
      <div class="title w-full">
        <h3 v-if="title">{{ title }}</h3>
        <h4 v-if="subtitle">
          <!-- eslint-disable vue/no-v-html -->
          <span v-html="subtitle" />
        </h4>
      </div>
      <div class="actions table-actions flex flex-1 justify-end">
        <div
          v-for="(action, actionIndex) in tableActions"
          :key="action.id"
          class="action"
        >
          <Button
            v-if="!action.options"
            type="button"
            :label="action.label"
            :icon="action.icon"
            :disabled="isVisible(action) === false"
            @click="actionHandler(action)"
          ></Button>
          <SplitButton
            v-if="!!action.options && action.options.type === 'split'"
            type="button"
            :label="action.label"
            :icon="action.icon"
            :model="action.options.values"
            :disabled="isVisible(action) === false"
            @click="actionHandler(action)"
          ></SplitButton>

          <Dropdown
            v-if="
              action.options &&
              action.options.type === 'search' &&
              action.options.valuesCallback
            "
            class="button p-button dropdown-search"
            :filter="true"
            :options="searchActionsMap.get(actionIndex)"
            option-label="label"
            option-value="value"
            :icon="action.icon"
            :disabled="isVisible(action) === false"
            panel-class="dropdown-search-panel"
            :empty-message="
              action.options.valuesCallback.filterPlaceholder
                ? action.options.valuesCallback.filterPlaceholder
                : ''
            "
            :empty-filter-message="
              action.options.valuesCallback.noResultsPlaceholder
                ? action.options.valuesCallback.noResultsPlaceholder
                : ''
            "
            @filter="
              filterActionHandler({
                query: $event.value,
                index: actionIndex,
                callback: action.options?.valuesCallback?.callback,
              })
            "
          >
            <template #value>
              <span class="pi pi-search ml-1 mr-2 text-white"></span>
              <span
                v-if="action.options.valuesCallback.placeholder"
                class="text-white"
              >
                {{ action.options.valuesCallback.placeholder }}
              </span>
              <span :class="action.icon" class="ml-2 text-white"></span>
            </template>
            <template #option="slotProps">
              <div
                v-for="(item, index) in slotProps"
                :key="index"
                :value="item.value"
                class="p-dropdown-item"
                @click="actionHandler(action, slotProps.option)"
              >
                <span class="color-primary mr-1 inline-block font-medium">
                  {{ item.label }}
                </span>
                <span v-if="item.institution" class="block">
                  ({{ item.institution }})
                </span>
              </div>
            </template>
          </Dropdown>

          <div v-if="!!action.options && action.options.type === 'menu'">
            <Button
              type="button"
              :disabled="editMode.length ? true : isVisible(action) === false"
              @click="toggle(action, $event)"
              >{{ action.label }} <span class="ml-3" :class="action.icon"></span
            ></Button>
            <Menu
              :ref="menus[action.id]"
              :model="action.options.values"
              :popup="true"
            />
          </div>
          <FileUpload
            v-if="!!action.options && action.options.type === 'fileUpload'"
            :mode="action.options.uploadOptions?.mode || 'basic'"
            :choose-label="action.label"
            :icon="action.icon"
            :multiple="action.options.uploadOptions?.multiple || false"
            :custom-upload="true"
            :auto="true"
            :disabled="isVisible(action) === false"
            @uploader="actionHandler(action, $event)"
          ></FileUpload>
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
      :scrolable="false"
      responsive-layout="scroll"
      :frozen-columns="2"
      :paginator="
        paginatorRows
          ? paginator && rows.length >= paginatorRows
          : paginator && rows.length >= 5
      "
      :rows="paginator ? paginatorRows : 5"
      @row-click="onRowClick($event)"
    >
      <Column
        v-if="frontRowActions.length"
        key="actions"
        :row-hover="true"
        class="row-actions"
        :frozen="true"
      >
        <template #body="slotProps">
          <div
            v-for="action in frontRowActions"
            :key="action.id"
            class="inline"
          >
            <Button
              v-if="isVisible(action, slotProps.data)"
              v-tooltip.bottom="action.tooltip ? action.tooltip : undefined"
              type="button"
              :title="action.label"
              :icon="action.icon"
              @click="rowActionHandler(action, slotProps.data)"
            ></Button>
          </div>
        </template>
      </Column>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :data-key="column.field"
        :row-hover="true"
        :sortable="column.sortable"
        :filter="tableFilter"
        :show-filter-match-modes="filterMatchMode(column)"
        :header-style="
          column.columnWidth ? 'width: ' + column.columnWidth : undefined
        "
      >
        <template v-if="column.editable" #editor="{ data, field }">
          <InputText
            v-if="
              column.type === MoreTableFieldType.string ||
              column.type === MoreTableFieldType.longtext ||
              !column.type
            "
            v-model="data[field]"
            style="width: 100%"
            autofocus
          />
          <Calendar
            v-if="column.type === MoreTableFieldType.calendar"
            v-model="data['__internalValue_' + field]"
            style="width: 100%"
            input-id="dateformat"
            autocomplete="off"
            date-format="dd/mm/yy"
          />
          <Dropdown
            v-if="column.type === MoreTableFieldType.choice"
            v-model="data[field]"
            class="w-full"
            :options="isEditableWithValues(column.editable)"
            option-label="label"
            option-value="value"
            :class="data[field] ? 'dropdown-has-value' : ''"
            :placeholder="
              data[field]
                ? getLabelForChoiceValue(data[field], getMoreTableChoiceValues(column.editable as MoreTableChoiceOptions))
                : column.placeholder
                ? column.placeholder
                : $t('global.placeholder.chooseDropdownOptionDefault')
            "
          />
          <MultiSelect
            v-if="
              column.type === MoreTableFieldType.multiselect ||
              column.type === MoreTableFieldType.singleselect
            "
            v-model="data[field]"
            :options="isEditableWithValues(column.editable)"
            option-label="label"
            :selection-limit="
              column.type === MoreTableFieldType.singleselect ? 1 : undefined
            "
            :placeholder="
              column.placeholder
                ? column.placeholder
                : $t('global.labels.chooseDropdownOptionDefault')
            "
            :show-toggle-all="false"
            class="z-top"
          />
          <div v-if="column.type === MoreTableFieldType.showIcon">
            <Checkbox
              v-if="getObservationVisibility(data['type'])?.changeable"
              v-model="data[field]"
              :binary="true"
              class="icon-checkbox show-icon"
            >
            </Checkbox>
            <div v-else class="icon-box eye">
              <span
                v-if="data[field]"
                class="pi pi-eye-slash color-important"
              />
              <span v-else class="pi pi-eye color-approved" />
            </div>
          </div>
        </template>
        <template
          v-if="column.filterable"
          #filter="{ filterModel, filterCallback }"
        >
          <InputText
            v-model="filterModel.value"
            type="text"
            class="p-column-filter"
            :placeholder="
              $t('moreTable.filterBy') + ` ` + column.header.toLowerCase()
            "
            @keydown.enter="filterCallback()"
          />
        </template>
        <template #body="{ data, field }">
          <div v-if="column.type === MoreTableFieldType.nested">
            {{ getNestedField(data, field) }}
          </div>
          <div v-if="column.type === MoreTableFieldType.nestedDatetime">
            {{ dayjs(getNestedField(data, field)).format('DD/MM/YYYY, HH:mm') }}
          </div>
          <div
            v-if="data[field] === null"
            v-tooltip.bottom="rowTooltipMsg ? rowTooltipMsg : undefined"
            class="placeholder"
          >
            {{ column.placeholder || $t('global.labels.no-value') }}
          </div>
          <div
            v-else
            v-tooltip.bottom="rowTooltipMsg ? rowTooltipMsg : undefined"
          >
            <span
              v-if="column.type === MoreTableFieldType.string || !column.type"
              :class="
                'table-value table-value-' +
                field +
                '-' +
                toClassName(data[field])
              "
            >
              <span v-if="column.arrayLabels">
                <span
                  v-for="(value, index) in getLabelForMultiSelectValue(
                    data[field],
                    column.arrayLabels
                  )"
                  :key="index"
                  class="multiselect-item"
                  >{{ value }}</span
                >
              </span>
              <span v-else>{{ data[field] }}</span>
            </span>
            <span v-if="column.type === MoreTableFieldType.statusString">
              {{ $t('study.statusStrings.' + data[field]) }}
            </span>
            <span v-if="column.type === MoreTableFieldType.choice">{{
              getLabelForChoiceValue(
                data[field],
                isEditableWithValues(column.editable)
              )
            }}</span>
            <span v-if="column.type === MoreTableFieldType.calendar">
              {{ dayjs(data['__internalValue_' + field]).format('DD/MM/YYYY') }}
            </span>
            <span v-if="column.type === MoreTableFieldType.datetime">
              <span v-if="data[field] !== '-'">
                {{ dayjs(data[field]).format('DD/MM/YYYY, HH:mm') }}
              </span>
              <span v-else>
                {{ data[field] }}
              </span>
            </span>
            <span v-if="column.type === MoreTableFieldType.longtext"
              >{{ shortenFieldText(data[field]) }}
            </span>
            <span
              v-if="
                column.type === MoreTableFieldType.multiselect ||
                column.type === MoreTableFieldType.singleselect
              "
            >
              <span
                v-for="(value, index) in getLabelForMultiSelectValue(
                  data[field]
                )"
                :key="index"
                class="multiselect-item"
                >{{ value }}</span
              >
            </span>
            <span
              v-if="column.type === MoreTableFieldType.showIcon"
              class="icon-box eye"
            >
              <span
                v-if="data[field]"
                class="pi pi-eye-slash color-important"
              />
              <span v-else class="pi pi-eye color-approved" />
            </span>
          </div>
        </template>
      </Column>

      <Column
        key="actions"
        :row-hover="true"
        class="row-actions"
        :frozen="true"
      >
        <template #body="slotProps">
          <div v-if="!isEditMode(slotProps.data)">
            <div v-for="action in rowActions" :key="action.id" class="inline">
              <Button
                v-tooltip.bottom="action.tooltip ? action.tooltip : undefined"
                type="button"
                :title="action.label"
                :icon="action.icon"
                :disabled="
                  editMode.length
                    ? true
                    : isVisible(action, slotProps.data) === false
                "
                :class="action.id === 'delete' ? 'btn-important' : ''"
                @click="rowActionHandler(action, slotProps.data)"
              >
                <span v-if="!action.icon">{{ action.label }}</span>
              </Button>
            </div>
            <Button
              v-if="rowEditBtn"
              v-tooltip.bottom="$t('tooltips.moreTable.editBtn')"
              type="button"
              icon="pi pi-pencil"
              :disabled="
                editMode.length ? true : isEditable(slotProps.data) === false
              "
              @click="edit(slotProps.data)"
            >
            </Button>
            <div
              v-for="action in rowEndActions"
              :key="action.id"
              class="inline"
            >
              <Button
                v-tooltip.bottom="action.tooltip ? action.tooltip : undefined"
                type="button"
                :title="action.label"
                :icon="action.icon"
                :disabled="
                  editMode.length
                    ? true
                    : isVisible(action, slotProps.data) === false
                "
                :class="action.id === 'delete' ? 'btn-important' : ''"
                @click="rowActionHandler(action, slotProps.data)"
              >
                <span v-if="!action.icon">{{ action.label }}</span>
              </Button>
            </div>
            <div v-if="rowEndIcon" class="ml-2 self-center">
              <span :class="rowEndIcon" style="font-size: 1.3rem" />
            </div>
          </div>
          <div v-else-if="isEditMode(slotProps.data)" class="items-center">
            <div class="error pi pi-exclamation-circle big" />
            <div class="error mx-2">{{ $t('moreTable.saveLine') }}</div>
            <Button
              v-tooltip.bottom="$t('tooltips.moreTable.saveChanges')"
              type="button"
              icon="pi pi-check"
              @click="save(slotProps.data)"
            ></Button>
            <Button
              v-tooltip.bottom="$t('tooltips.moreTable.cancelAction')"
              type="button"
              icon="pi pi-times"
              class="btn-gray"
              @click="cancel(slotProps.data)"
            ></Button>
            <div v-if="rowEndIcon" class="ml-2 self-center">
              <span :class="rowEndIcon" style="font-size: 1.3rem" />
            </div>
          </div>
        </template>
      </Column>
      <template #empty>
        {{ emptyMessage }}
      </template>
      <template #loading> </template>
    </DataTable>
  </div>
</template>

<style scoped lang="postcss">
  @import '../../styles/components/eye-checkbox.pcss';

  .pi.big {
    font-size: 1.2rem;
  }

  :deep(.dropdown-has-value .p-dropdown-label) {
    color: var(--text-color) !important;
  }

  :deep(.more-table .row-actions) {
    pointer-events: none;
  }
  :deep(.more-table td.row-actions div) {
    justify-content: flex-end;
  }
  .more-table {
    :deep(.p-datatable-loading-overlay) {
      filter: blur(5px);
      background-color: #ffffff99;
    }

    :deep(.pi-exclamation-circle.big:before) {
      font-size: 30px;
    }

    h3 {
      font-weight: 600;
    }

    h4 {
      font-size: 1rem;
    }

    .row-actions {
      pointer-events: none;
      button {
        margin: 0 0.188rem;
      }
      div {
        display: flex;
      }
    }

    .actions {
      .action {
        margin-left: 0.625rem;
      }
    }

    table tbody tr {
      font-size: 0.906rem !important;

      td:last-child {
        width: 1%;
        white-space: nowrap;
      }
    }

    :deep(td.row-actions) {
      pointer-events: none;
      div {
        place-content: end;
      }
      .p-button {
        pointer-events: all;
        &.p-disabled {
          pointer-events: none;
        }
      }
    }

    .placeholder {
      font-style: italic;
      color: #ccc;
    }

    .p-multiselect {
      width: 100%;
      z-index: 1000;
    }

    .p-checkbox .p-checkbox-box {
      border-radius: 50%;
    }

    .multiselect-item {
      &:after {
        content: ', ';
      }
      &:last-of-type:after {
        content: '';
      }
    }

    .p-dropdown .p-dropdown-label.p-placeholder {
      color: var(--surface-a) !important;
    }
    .p-dropdown-trigger {
      display: none !important;
    }
    .dropdown-search {
      padding: 0 !important;

      &:hover,
      &:active,
      &:focus {
        border: var(--border-weight) var(--border-style)
          var(--primary-color--secondary);
        background-color: var(--primary-color--secondary);
      }
    }
  }
  .dropdown-search-panel {
    min-width: 350px !important;
    width: 450px;
    left: 705px;
    min-height: 250px;
    line-break: normal;

    .p-dropdown-item:nth-child(2) {
      display: none;
    }
    .p-dropdown-item:nth-child(1) {
      width: 100%;
    }

    ul li {
      display: flex;
      line-break: normal;
    }

    :deep(.p-tooltip-text) {
      text-align: center;
    }
  }
  .table-btn-min-height .table-actions button {
    min-height: 60px;
  }

  .table-title-width .title {
    max-width: 80%;
  }

  :deep(.icon-checkbox.p-checkbox.show-icon) {
    height: 100%;
    padding: 5px;
  }
</style>

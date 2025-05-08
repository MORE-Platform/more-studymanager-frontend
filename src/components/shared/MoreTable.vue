/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { Ref, ref, watch } from 'vue';
  import {
    MoreTableAction,
    MoreTableChoice,
    MoreTableColumn,
    MoreTableEditable,
    MoreTableFieldType,
    MoreTableRowActionResult,
    MoreTableSortOptions,
    RowSelectionMode,
  } from '../../models/MoreTableModel';
  import DataTable, {
    DataTableFilterMeta,
    DataTableFilterMetaData,
    DataTableRowClickEvent,
  } from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import InputNumber from 'primevue/inputnumber';
  import Calendar from 'primevue/calendar';
  import Dropdown from 'primevue/dropdown';
  import MultiSelect from 'primevue/multiselect';
  import Checkbox from 'primevue/checkbox';
  import { FilterMatchMode } from 'primevue/api';
  import { dateToDateString } from '../../utils/dateUtils';
  import {
    ComponentFactory,
    StudyRole,
    StudyStatus,
    Visibility,
  } from '@gs';
  import { shortenText } from '../../utils/commonUtils';
  import { useGlobalStore } from '../../stores/globalStore';

  const dateFormat = useGlobalStore().getDateFormat;

  interface MoreTableProps {
    title?: string;
    subtitle?: string;
    rowId: string;
    columns: MoreTableColumn[];
    rows: any[];
    rowActions?: MoreTableAction[];
    frontRowActions?: MoreTableAction[];
    endRowActions?: MoreTableAction[];
    sortOptions?: MoreTableSortOptions;
    editable?: (data: any) => boolean;
    editableAccess?: boolean;
    rowEditBtn?: boolean;
    emptyMessage?: string;
    loading?: boolean;
    editAccessRoles?: StudyRole[];
    paginatorRows?: number;
    componentFactory?: ComponentFactory[];
    enableRowSelection?: RowSelectionMode;
  }

  const props = withDefaults(defineProps<MoreTableProps>(), {
    title: undefined,
    subtitle: undefined,
    rowActions: (): MoreTableAction[] => [],
    frontRowActions: (): MoreTableAction[] => [],
    endRowActions: (): MoreTableAction[] => [],
    sortOptions: undefined,
    // eslint-disable-next-line
    editable: (data: any) => true,
    editableAccess: true,
    rowEditBtn: true,
    emptyMessage: undefined,
    loading: false,
    editAccessRoles: (): StudyRole[] => [],
    paginatorRows: undefined,
    componentFactory: undefined,
    enableRowSelection: undefined,
  });

  const emit = defineEmits<{
    (e: 'onSelect', row: any): void;
    (e: 'onAction', result: MoreTableRowActionResult): void;
    (e: 'onChange', row: any): void;
  }>();

  const tableFilter: Ref<DataTableFilterMeta> = ref(createTableFilter());

  function createTableFilter(): DataTableFilterMeta {
    const filterObject: DataTableFilterMeta = {};

    props.columns.forEach((column) => {
      if (column.filterable) {
        filterObject[column.field] = {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        } as DataTableFilterMetaData;
      }
    });

    return filterObject;
  }

  const enableEditMode = ref(false);
  updateEditableStatus();

  function updateEditableStatus(): void {
    if (props.editableAccess) {
      enableEditMode.value = props.columns.some((c) => c.editable);
    } else {
      enableEditMode.value = false;
    }
  }

  watch(
    () => props.editableAccess,
    () => {
      updateEditableStatus();
    },
  );

  function rowActionHandler(action: MoreTableAction, row: any): void {
    if (action.confirmDeleteDialog) {
      action.confirmDeleteDialog.dialog(row);
    } else {
      emit('onAction', { id: action.id, row });
    }
  }

  function isVisible(action: MoreTableAction, row: any = undefined): boolean {
    return action.visible === undefined || action.visible(row);
  }

  const rowIDsInEditMode: Ref<any[]> = ref([]);

  function isRowInEditMode(row: any): boolean {
    if (row[props.rowId]) {
      return rowIDsInEditMode.value.includes(row[props.rowId]);
    }
    return false;
  }

  const editingRows: Ref<any[]> = ref([]);

  function setRowToEditMode(row: any): void {
    rowIDsInEditMode.value = [];
    editingRows.value = [];

    if (row[props.rowId]) {
      rowIDsInEditMode.value.push(row[props.rowId]);
    }

    editingRows.value.push(row);
  }

  function cancelEditMode(row: any): void {
    editingRows.value.splice(
      editingRows.value.findIndex((r) => r[props.rowId] === row[props.rowId]),
    );
    rowIDsInEditMode.value.splice(
      rowIDsInEditMode.value.findIndex((r) => r === row[props.rowId]),
    );
  }

  function saveEditChanges(row: any): void {
    emit('onChange', cleanRow(row));
    cancelEditMode(row);
  }

  function isRowEditable(row: any): boolean {
    if (!props.editableAccess) {
      return false;
    }

    if (row.userRoles) {
      return (
        row.userRoles.some((r: StudyRole) =>
          props.editAccessRoles.includes(r),
        ) &&
        [
          StudyStatus.Draft,
          StudyStatus.Paused,
          StudyStatus.PausedPreview,
        ].includes(row.status)
      );
    }

    return props.editable(row);
  }

  function onRowClick(event: DataTableRowClickEvent): void {
    if (rowIDsInEditMode.value.length === 0) {
      emit('onSelect', event.data[props.rowId]);
    }
  }

  function prepareRows(rows: any): any {
    return rows.map((row: any) => {
      props.columns.forEach((column) => {
        if (column.type === MoreTableFieldType.calendar) {
          row[`__internalValue_${column.field}`] = column.field
            ? new Date(row[column.field])
            : undefined;
        }
      });
      return row;
    });
  }

  function cleanRow(row: any): any {
    props.columns.forEach((column) => {
      if (column.type === MoreTableFieldType.calendar) {
        const date = row[`__internalValue_${column.field}`];
        row[column.field] = dateToDateString(date);
        delete row[`__internalValue_${column.field}`];
      }
    });
    return row;
  }

  function getLabelForChoiceValue(
    value: any,
    values: MoreTableChoice[],
  ): string {
    return (
      values.find((s: any) => s.value === value?.toString())?.label || value
    );
  }

  function getLabelForMultiSelectValue(
    setValues: any,
    valueChoices?: MoreTableChoice[],
  ): string[] {
    if (valueChoices) {
      const labels: string[] = [];
      setValues.forEach((v: StudyRole) => {
        const valueLabel = valueChoices.find((vc) => vc.value === v);
        if (valueLabel) {
          labels.push(valueLabel.label);
        }
      });
      return labels;
    }

    return setValues.map((c: MoreTableChoice) => c.label);
  }

  function getColumnEditableValues(
    editable: boolean | MoreTableEditable | undefined,
  ): MoreTableChoice[] {
    if (editable === undefined || typeof editable === 'boolean') return [];

    return editable.values;
  }

  function isColumnEditable(
    editable: boolean | MoreTableEditable | undefined,
  ): boolean {
    if (editable === undefined) return false;
    if (typeof editable === 'boolean') return editable;
    return editable.enabled;
  }

  function getObservationVisibility(type: string): Visibility | undefined {
    return props.componentFactory?.find((cf) => cf.componentId === type)
      ?.visibility;
  }
</script>

<template>
  <div class="more-table">
    <div class="mb-8 flex flex-row items-center justify-between">
      <div class="title w-full">
        <h3 v-if="title" class="font-semibold">{{ title }}</h3>
        <h4 v-if="subtitle" class="text-base">
          <!-- eslint-disable vue/no-v-html -->
          <span v-html="subtitle" />
        </h4>
      </div>
      <div
        class="actions table-actions ml-2.5 flex flex-row items-center justify-end"
      >
        <slot
          name="tableActions"
          :is-in-edit-mode="rowIDsInEditMode.length"
        ></slot>
      </div>
    </div>

    <DataTable
      v-model:editing-rows="editingRows"
      v-model:filters="tableFilter"
      :value="prepareRows(rows)"
      :sort-field="sortOptions?.sortField"
      :sort-order="sortOptions?.sortOrder"
      :edit-mode="enableEditMode ? 'row' : undefined"
      :loading="loading"
      filter-display="menu"
      :selection-mode="enableRowSelection"
      :scrolable="false"
      :frozen-columns="2"
      :paginator="!!paginatorRows && rows.length > paginatorRows"
      :rows="paginatorRows"
      @row-click="onRowClick($event)"
    >
      <Column
        v-if="frontRowActions?.length"
        key="actions"
        class="row-actions"
        :frozen="true"
      >
        <template #body="slotProps">
          <div v-for="action in frontRowActions" :key="action.id">
            <Button
              v-if="isVisible(action, slotProps.data)"
              v-tooltip.bottom="action.tooltip ?? undefined"
              type="button"
              :icon="action.icon"
              @click="rowActionHandler(action, slotProps.data)"
            />
          </div>
        </template>
      </Column>

      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :data-key="column.field"
        :sortable="column.sortable"
        :filter="tableFilter"
        :show-filter-match-modes="false"
        :header-style="
          column.columnWidth ? `width: ${column.columnWidth}` : undefined
        "
      >
        <template #filterclear="{ filterCallback }">
          <Button
            type="button"
            outlined
            severity="cancel"
            :label="$t('global.labels.cancel')"
            @click="filterCallback()"
          />
        </template>
        <template #filterapply="{ filterCallback }">
          <Button
            type="button"
            severity="info"
            :label="$t('global.labels.apply')"
            @click="filterCallback()"
          />
        </template>
        <template
          v-if="isColumnEditable(column.editable)"
          #editor="{ data, field }"
        >
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
          <InputNumber
            v-if="column.type === MoreTableFieldType.number"
            v-model="data[field]"
            style="width: 100%"
            :placeholder="column.placeholder"
          />
          <Calendar
            v-if="column.type === MoreTableFieldType.calendar"
            v-model="data[`__internalValue_${field}`]"
            style="width: 100%"
            class="min-w-[90px]"
            input-id="dateformat"
            autocomplete="off"
            :date-format="dateFormat"
          />
          <div v-if="column.type === MoreTableFieldType.choice">
            <Dropdown
              v-if="isColumnEditable(column.editable)"
              v-model="data[field]"
              class="w-full"
              :options="getColumnEditableValues(column.editable)"
              option-label="label"
              option-value="value"
              :class="{ 'dropdown-has-value': data[field] }"
              :placeholder="
                data[field]
                  ? getLabelForChoiceValue(
                      data[field],
                      getColumnEditableValues(column.editable),
                    )
                  : (column.placeholder ??
                    $t('global.placeholder.chooseDropdownOptionDefault'))
              "
            />
            <span v-else>{{
              getLabelForChoiceValue(
                data[field],
                getColumnEditableValues(column.editable),
              )
            }}</span>
          </div>
          <MultiSelect
            v-if="
              column.type === MoreTableFieldType.multiselect ||
              column.type === MoreTableFieldType.singleselect
            "
            v-model="data[field]"
            :options="getColumnEditableValues(column.editable)"
            option-label="label"
            :selection-limit="
              column.type === MoreTableFieldType.singleselect ? 1 : undefined
            "
            :placeholder="
              column.placeholder ??
              $t('global.placeholder.chooseDropdownOptionDefault')
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
              <template #icon>
                <div class="p-checkbox-box">
                  <span class="p-checkbox-icon pi pi-check"></span>
                </div>
              </template>
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
            :placeholder="`${$t('moreTable.filterBy')} ${column.header.toLowerCase()}`"
            @keydown.enter="filterCallback()"
          />
        </template>
        <template #body="{ data, field }">
          <div v-if="data[field] === null" class="placeholder">
            {{ column.placeholder ?? $t('global.labels.noValue') }}
          </div>
          <div v-else>
            <span
              v-if="
                column.type === MoreTableFieldType.string ||
                column.type === MoreTableFieldType.number ||
                !column.type
              "
              class="table-value"
            >
              <span v-if="column.arrayLabels">
                <span
                  v-for="(value, index) in getLabelForMultiSelectValue(
                    data[field],
                    column.arrayLabels,
                  )"
                  :key="index"
                  class="multiselect-item"
                  >{{ value }}</span
                >
              </span>
              <span v-else>{{ data[field] }}</span>
            </span>
            <span v-if="column.type === MoreTableFieldType.statusString">
              {{ $t(`study.statusStrings.${data[field]}`) }}
            </span>
            <span v-if="column.type === MoreTableFieldType.choice">{{
              getLabelForChoiceValue(
                data[field],
                getColumnEditableValues(column.editable),
              )
            }}</span>
            <span v-if="column.type === MoreTableFieldType.calendar">
              {{ $d(new Date(data[`__internalValue_${field}`]), 'short') }}
            </span>
            <span v-if="column.type === MoreTableFieldType.datetime">
              <span v-if="!data[field]"> - </span>
              <span v-else-if="data[field] && data[field] !== '-'">
                {{ $d(new Date(data[field]), 'long') }}
              </span>
              <span v-else>
                {{ data[field] }}
              </span>
            </span>
            <span v-if="column.type === MoreTableFieldType.longtext"
              >{{ shortenText(data[field]) }}
            </span>
            <span
              v-if="
                column.type === MoreTableFieldType.multiselect ||
                column.type === MoreTableFieldType.singleselect
              "
            >
              <span
                v-for="(value, index) in getLabelForMultiSelectValue(
                  data[field],
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
            <span
              v-if="column.type === MoreTableFieldType.binaryIcon"
              class="icon-box eye"
            >
              <span v-if="data[field]" class="pi pi-check color-approved" />
              <span v-else class="pi pi-times color-important" />
            </span>
          </div>
        </template>
      </Column>

      <Column key="actions" class="row-actions" :frozen="true">
        <template #body="slotProps">
          <div v-if="!isRowInEditMode(slotProps.data)">
            <div v-for="action in rowActions" :key="action.id">
              <Button
                v-tooltip.bottom="action.tooltip ?? undefined"
                type="button"
                :icon="action.icon"
                :disabled="
                  rowIDsInEditMode.length
                    ? true
                    : !isVisible(action, slotProps.data)
                "
                :class="{ 'btn-important': action.id === 'delete' }"
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
                rowIDsInEditMode.length ? true : !isRowEditable(slotProps.data)
              "
              @click="setRowToEditMode(slotProps.data)"
            />
            <div v-for="action in endRowActions" :key="action.id">
              <Button
                v-tooltip.bottom="action.tooltip ?? undefined"
                type="button"
                :icon="action.icon"
                :disabled="
                  rowIDsInEditMode.length
                    ? true
                    : !isVisible(action, slotProps.data)
                "
                :class="{ 'btn-important': action.id === 'delete' }"
                @click="rowActionHandler(action, slotProps.data)"
              >
                <span v-if="!action.icon">{{ action.label }}</span>
              </Button>
            </div>
          </div>
          <div v-else-if="isRowInEditMode(slotProps.data)" class="items-center">
            <div class="error pi pi-exclamation-circle big" />
            <div class="error mx-2">{{ $t('moreTable.saveLine') }}</div>
            <Button
              v-tooltip.bottom="$t('tooltips.moreTable.saveChanges')"
              type="button"
              icon="pi pi-check"
              @click="saveEditChanges(slotProps.data)"
            />
            <Button
              v-tooltip.bottom="$t('tooltips.moreTable.cancelAction')"
              type="button"
              icon="pi pi-times"
              class="btn-gray"
              @click="cancelEditMode(slotProps.data)"
            />
          </div>
        </template>
      </Column>
      <template #empty>
        {{ emptyMessage ?? $t('moreTable.defaultEmptyMsg') }}
      </template>
      <template #loading></template>
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

  .more-table {
    :deep(.p-datatable-loading-overlay) {
      filter: blur(5px);
      background-color: #ffffff99;
    }

    :deep(.p-datatable .p-datatable-tbody > tr:focus) {
      outline: none;
    }

    :deep(.pi-exclamation-circle.big:before) {
      font-size: 30px;
    }

    table tbody tr {
      font-size: 0.906rem !important;
      @apply cursor-pointer;

      td:last-child {
        width: 1%;
        white-space: nowrap;
      }
    }

    :deep(td.row-actions) {
      pointer-events: none;

      div {
        display: flex;
        justify-content: flex-end;
      }

      button {
        margin: 0 0.188rem;
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
  }

  .table-title-width .title {
    max-width: 80%;
  }

  :deep(.icon-checkbox.p-checkbox.show-icon) {
    height: 100%;
    padding: 5px;
  }
</style>

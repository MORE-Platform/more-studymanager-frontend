<script setup lang="ts">
import {PropType} from 'vue'
import {MoreTableColumn, MoreTableAction, MoreTableActionResult} from '../../models/MoreTableModel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import {Study} from '../../generated-sources/openapi';

defineProps({
  title: {
    type: String,
    default: '',
  },
  columns: {
    type: Array as PropType<Array<MoreTableColumn>>,
    required: true,
  },
  data: {
    type: Array as PropType<Array<Study>>,
    required: true,
  },
  rowActions: {
    type: Array as PropType<Array<MoreTableAction>>,
    default: () => [],
  },
  tableActions: {
    type: Array as PropType<Array<MoreTableAction>>,
    default: () => [],
  }
})

const emit = defineEmits<{
  (e: 'onselect', rowKey: string): void
  (e: 'onaction', result: MoreTableActionResult): void
}>()

function selectHandler(rowKey: string) {
  emit('onselect', rowKey)
}

function actionHandler(id: string, data: unknown) {
  emit('onaction', {id, data})
}

</script>

<template>
  <div>
    <h3>{{ title }}</h3>

    <DataTable
      :value="data"
      selection-mode="single"
      responsive-layout="scroll"
      @row-click="selectHandler($event.data[id])"
    >
      <Column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :header="$t(column.header)"
        :data-key="column.field"
        :row-hover="true"
      >
        <template #body="slotProps">
          {{ slotProps.data[column.field] }}
        </template>
      </Column>

      <Column
        key="actions"
        :header="$t('actions')"
        :row-hover="true"
      >
        <template #body="slotProps">
          <Button v-for="action in rowActions" type="button" :title="action.label" :icon="action.icon" @click="actionHandler(action.id, slotProps.data)"></Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style lang="postcss"></style>

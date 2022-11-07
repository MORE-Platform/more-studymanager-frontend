<script setup lang="ts">
import {PropType} from 'vue'
import DatatableColumn from '../../models/DatatableColumn'
import PrimeVueDataTable from 'primevue/datatable'
import PrimeVueColumn from 'primevue/column'
import {Study} from '../../generated-sources/openapi';

defineProps({
  title: {
    type: String,
    default: '',
  },
  columns: {
    type: Array as PropType<Array<DatatableColumn>>,
    required: true,
  },
  data: {
    type: Array as PropType<Array<Study>>,
    required: true,
  }
})

const emit = defineEmits<{
  (e: 'onSelect', value: string): void
  (e: 'onAction', id: string): void
}>()

function selectClickHandler(id: string) {
  emit('onSelect', id)
}

</script>

<template>
  <div>
    <h3>{{ title }}</h3>

    <PrimeVueDataTable
      :value="data"
      selection-mode="single"
      responsive-layout="scroll"
      @row-click="selectClickHandler($event.data[id])"
    >
      <PrimeVueColumn
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
      </PrimeVueColumn
      >
    </PrimeVueDataTable>
  </div>
</template>

<style lang="postcss"></style>

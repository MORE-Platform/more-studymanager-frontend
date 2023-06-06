<script setup lang="ts">
  import { StringListProperty } from '../../../models/InputModels';
  import { PropType } from 'vue';
  import InputText from 'primevue/inputtext';

  const props = defineProps({
    property: {
      type: Object as PropType<StringListProperty>,
      required: true,
    },
  });

  const update = (event: KeyboardEvent, index: number) => {
    if (props.property.value) {
      props.property.value[index] = (event.target as HTMLInputElement).value;
    }
  };
</script>

<template>
  <div class="flex flex-col gap-2">
    <label>{{ $t(property.name) }}</label>
    <!-- eslint-disable -->
    <InputText
      v-for="index in property.maxSize"
      :key="index"
      :value="property.value?.[index - 1]"
      @keyup="update($event, index-1)"
      type="text"
      style="display: block"
    />
    <!-- eslint-enable -->
    <small>{{ $t(props.property.description) }}</small>
  </div>
</template>

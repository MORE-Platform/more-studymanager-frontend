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
</script>

<template>
  <div class="flex flex-col gap-2">
    <label>{{ property.name }}</label>
    <InputText
      v-for="index in property.maxSize"
      :key="index"
      v-model="property.value[index - 1]"
      type="text"
      style="display: block"
    />
    <small>{{ props.property.description }}</small>
  </div>
</template>

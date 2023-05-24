<script setup lang="ts">
  import { IntegerProperty } from '../../../models/InputModels';
  import { PropType } from 'vue';
  import InputText from 'primevue/inputtext';

  const props = defineProps({
    property: {
      type: Object as PropType<IntegerProperty>,
      required: true,
    },
  });
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="property.id">{{ property.name }}</label>
    <InputText
      :id="property.id"
      v-model="property.value"
      type="number"
      :max="property.max"
      :min="property.min"
      :aria-describedby="property.id + '-help'"
    />
    <small :id="property.id + '-help'">{{ props.property.description }}</small>
  </div>
</template>

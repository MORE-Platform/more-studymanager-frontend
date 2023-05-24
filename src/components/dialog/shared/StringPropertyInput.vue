<script setup lang="ts">
  import { StringProperty } from '../../../models/InputModels';
  import { PropType } from 'vue';
  import InputText from 'primevue/inputtext';

  const props = defineProps({
    property: {
      type: Object as PropType<StringProperty>,
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
      type="text"
      :aria-describedby="property.id + '-help'"
    />
    <small :id="property.id + '-help'">{{ props.property.description }}</small>
  </div>
</template>

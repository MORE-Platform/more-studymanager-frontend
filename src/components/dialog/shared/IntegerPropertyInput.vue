/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { IntegerProperty } from '../../../models/InputModels';
  import { PropType, watch } from 'vue';
  import InputNumber from 'primevue/inputnumber';

  const props = defineProps({
    property: {
      type: Object as PropType<IntegerProperty>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    (e: 'onInputChange', integerInput: IntegerProperty): void;
  }>();

  watch(props.property, () => {
    emit('onInputChange', props.property);
  });
</script>

<template>
  <div class="gap-1">
    <h5 class="font-bold">
      <label :for="property.id"
        >{{ $t(property.name) }}<span v-if="property.required">*</span></label
      >
    </h5>

    <div v-if="props.property.description" :id="`${property.id}-help`">
      {{ $t(props.property.description) }}
    </div>

    <InputNumber
      :id="property.id"
      v-model="property.value"
      type="number"
      :max="property.max"
      :min="property.min"
      :disabled="!editable"
      class="mt-1 w-full"
      :aria-describedby="`${property.id}-help`"
    />
  </div>
</template>

<style scoped lang="postcss">
  :deep(.p-inputnumber) {
    border: transparent;
    padding: 0;
  }
</style>

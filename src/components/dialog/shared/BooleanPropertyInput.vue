/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { BooleanProperty } from '../../../models/InputModels';
  import { PropType, ref, Ref } from 'vue';
  import Checkbox from 'primevue/checkbox';

  const props = defineProps({
    property: {
      type: Object as PropType<BooleanProperty>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const booleanChecked: Ref<boolean> = ref(
    props.property.value ?? props.property.defaultValue ?? false,
  );

  const emit = defineEmits<{
    (e: 'onBooleanChange', boolean: boolean): void;
  }>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <h5 class="font-bold">
      <label v-if="property.name" :for="property.id">
        {{ $t(property.name) }}<span v-if="property.required">*</span>
      </label>
    </h5>
    <div v-if="props.property.description" :id="`${property.id}-help`">
      {{ $t(props.property.description) }}
    </div>

    <div class="flex items-center">
      <Checkbox
        v-model="booleanChecked"
        :label="property.name"
        class="mr-2"
        :required="property.required"
        :binary="true"
        @change="emit('onBooleanChange', booleanChecked)"
      />
      {{ $t(property.name) }}
    </div>
  </div>
</template>

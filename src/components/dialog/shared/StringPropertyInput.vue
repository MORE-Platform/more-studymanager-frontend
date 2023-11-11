/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Österreichische Vereinigung zur
 * Förderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
<script setup lang="ts">
  import { StringProperty } from '../../../models/InputModels';
  import { PropType, watch } from 'vue';
  import InputText from 'primevue/inputtext';

  const props = defineProps({
    property: {
      type: Object as PropType<StringProperty>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    (e: 'onInputChange', stringProperty: StringProperty): void;
  }>();

  watch(props.property, () => {
    emit('onInputChange', props.property);
  });
</script>

<template>
  <div class="flex flex-col gap-1">
    <h6 class="font-bold">
      <label v-if="property.name" :for="property.id"
        >{{ $t(property.name) }}<span v-if="property.required">*</span></label
      >
    </h6>
    <div v-if="props.property.description" :id="property.id + '-help'">
      {{ $t(props.property.description) }}
    </div>

    <InputText
      :id="property.id"
      v-model="property.value"
      type="text"
      class="w-full"
      :aria-describedby="property.id + '-help'"
      :disabled="!editable"
      :placeholder="
        props.property.description
          ? $t(props.property.description)
          : 'Enter text value'
      "
    />
  </div>
</template>

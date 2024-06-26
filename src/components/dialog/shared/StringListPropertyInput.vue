/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { StringListProperty } from '../../../models/InputModels';
  import { PropType, watch } from 'vue';
  import InputText from 'primevue/inputtext';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps({
    property: {
      type: Object as PropType<StringListProperty>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const update = (event: KeyboardEvent, index: number): void => {
    if (props.property.value) {
      props.property.value[index] = (event.target as HTMLInputElement).value;
    }
  };

  const emit = defineEmits<{
    (e: 'onInputChange', stringListProperty: StringListProperty): void;
  }>();

  watch(props.property, () => {
    emit('onInputChange', props.property);
  });
</script>

<template>
  <div class="flex flex-col gap-1">
    <h6 class="font-bold">
      <label
        >{{ $t(property.name) }}<span v-if="property.required">*</span
        ><span v-if="property.required">*</span></label
      >
    </h6>
    <div>{{ $t(props.property.description) }}</div>
    <div v-if="editable" class="flex w-full flex-col gap-1">
      <InputText
        v-for="index in property.maxSize"
        :key="index"
        class="w-full"
        :class="!editable && property.value?.[index - 1] ? 'w-fit' : 'hidden'"
        :value="property.value?.[index - 1]"
        type="text"
        :disabled="!editable"
        :placeholder="t('global.labels.option', { value: index })"
        style="display: block"
        @keyup="update($event, index - 1)"
      />
    </div>
    <div v-else-if="!editable" class="space-around flex flex-row">
      <div
        v-for="index in property.maxSize"
        :key="index"
        class="flex items-center"
      >
        <span>{{ property.value?.[index - 1] }}</span>
        <span
          v-if="property.value?.[index] && index !== property.maxSize"
          class="pi pi-circle-fill px-2"
          style="font-size: 5px"
        >
        </span>
      </div>
    </div>
  </div>
</template>

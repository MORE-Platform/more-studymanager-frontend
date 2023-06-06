<script setup lang="ts">
  import { StringListProperty } from '../../../models/InputModels';
  import { PropType } from 'vue';
  import InputText from 'primevue/inputtext';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

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
  <div class="flex flex-col gap-1">
    <h6 class="font-bold">
      <label
        >{{ $t(property.name) }}<span v-if="property.required">*</span
        ><span v-if="property.required">*</span></label
      >
    </h6>
    <small>{{ $t(props.property.description) }}</small>
    <!-- eslint-disable -->
    <InputText
      v-for="index in property.maxSize"
      :key="index"
      :value="property.value?.[index - 1]"
      @keyup="update($event, index-1)"
      type="text"
      :placeholder="t('global.labels.option') + ' ' + index"
      style="display: block"
    />
    <!-- eslint-enable -->
  </div>
</template>

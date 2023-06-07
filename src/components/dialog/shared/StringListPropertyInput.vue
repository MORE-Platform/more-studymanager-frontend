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
    editable: {
      type: Boolean,
      default: true,
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
    <div v-if="editable" class="w-full flex gap-1 flex-col">
      <InputText
        v-for="index in property.maxSize"
        class="w-full"
        :class="!editable && property.value?.[index - 1] ? 'w-fit' : 'hidden'"
        :key="index"
        :value="property.value?.[index - 1]"
        @keyup="update($event, index-1)"
        type="text"
        :disabled="!editable"
        :placeholder="t('global.labels.option') + ' ' + index"
        style="display: block"
      />
    </div>
    <div v-else-if="!editable" class="flex flex-row space-around">
      <div v-for="index in property.maxSize" class="flex items-center">
        <span>{{property.value?.[index-1]}}</span>
        <span v-if="property.value?.[index] && index !== property.maxSize" class="pi pi-circle-fill px-2" style="font-size: 5px;"> </span>
      </div>
    </div>
    <!-- eslint-enable -->
  </div>
</template>

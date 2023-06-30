<script setup lang="ts">
  import { StringProperty } from '../../../models/InputModels';
  import { PropType } from 'vue';
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
</script>

<template>
  <div class="flex flex-col gap-1">
    <h6 class="font-bold">
      <label :for="property.id"
        >{{ $t(property.name) }}<span v-if="property.required">*</span></label
      >
    </h6>
    <small :id="property.id + '-help'">{{
      $t(props.property.description)
    }}</small>

    <InputText
      :id="property.id"
      v-model="property.value"
      type="text"
      class="w-full"
      :aria-describedby="property.id + '-help'"
      :disabled="!editable"
      :placeholder="$t(props.property.description)"
    />
  </div>
</template>

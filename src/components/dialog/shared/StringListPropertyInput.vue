<script setup lang="ts">
import {StringProperty} from '../../../models/InputModels';
import {PropType, ref, Ref} from 'vue';

const props = defineProps({
  property: {
    type: Object as PropType<StringListProperty>,
    required: true,
  }
});
</script>

<template>
  <div class="flex flex-column gap-2">
    <label>{{ property.name }}</label>
    <small>{{ props.property.description }}</small>
    <InputText v-for="(v, index) in property.value.values" :key="index" v-model="v" />
  </div>
</template>

<script setup lang="ts">
import {StringProperty} from '../../../models/InputModels';
import {PropType, ref, Ref} from 'vue';

const props = defineProps({
  property: {
    type: Object as PropType<StringProperty>,
    required: true,
  }
});
</script>

<template>
  <div class="flex flex-column gap-2">
    <label :for="property.id">{{ property.name }}</label>
    <InputText :id="property.id" v-model="property.value" :aria-describedby="property.id + '-help'" />
    <small :id="property.id + '-help'">{{ props.property.description }}</small>
  </div>
</template>

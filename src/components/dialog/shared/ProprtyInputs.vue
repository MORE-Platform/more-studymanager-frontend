<script setup lang="ts">
  import { PropType } from 'vue';
  import {
    BooleanProperty,
    CronProperty,
    DataCheckProperty,
    IntegerProperty,
    Property,
    StringListProperty,
    StringProperty,
    StringTextProperty,
  } from '../../../models/InputModels';
  import StringPropertyInput from './StringPropertyInput.vue';
  import StringTextPropertyInput from './StringTextPropertyInput.vue';
  import StringListPropertyInput from './StringListPropertyInput.vue';
  import IntegerPropertyInput from './IntegerPropertyInput.vue';
  import {
    PropertyEmit,
    StringEmit,
  } from '../../../models/PropertyInputModels';
  import CronSchedulerConfiguration from '../../forms/CronSchedulerConfiguration.vue';
  import InterventionTriggerConditions from '../../forms/InterventionTriggerConditions.vue';
  import BooleanPropertyInput from './BooleanPropertyInput.vue';

  defineProps({
    propertyList: {
      type: Array as PropType<Property<any>[]>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    styleModifier: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits<{
    (e: 'onPropertyChange', item: PropertyEmit): void;
    (e: 'onError', item: StringEmit): void;
  }>();
</script>

<template>
  <div class="property-inputs" :class="styleModifier">
    <div v-for="(property, index) in propertyList" :key="index">
      <StringPropertyInput
        v-if="property instanceof StringProperty"
        :property="property"
        :class="index < propertyList.length - 1 ? 'mb-4' : ''"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <StringTextPropertyInput
        v-if="property instanceof StringTextProperty"
        :property="property"
        :editable="editable"
        :class="index < propertyList.length - 1 ? 'mb-4' : ''"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <IntegerPropertyInput
        v-if="property instanceof IntegerProperty"
        :property="property"
        :class="index < propertyList.length - 1 ? 'mb-4' : ''"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <StringListPropertyInput
        v-if="property instanceof StringListProperty"
        :class="index < propertyList.length - 1 ? 'mb-4' : ''"
        :property="property"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <BooleanPropertyInput
        v-if="property instanceof BooleanProperty"
        :class="index < propertyList.length - 1 ? 'mb-4' : ''"
        :property="property"
        :editable="editable"
        @on-boolean-change="
          emit('onPropertyChange', { value: $event, index: index })
        "
      />

      <CronSchedulerConfiguration
        v-if="property instanceof CronProperty"
        :class="index < propertyList.length - 1 ? 'mb-6' : ''"
        :editable="editable"
        :cron-schedule="property.value"
        @on-valid-schedule="
          emit('onPropertyChange', { value: $event, index: index })
        "
        @on-error="
          emit('onError', { value: $event ? $event : '', index: index })
        "
      />

      <InterventionTriggerConditions
        v-if="property instanceof DataCheckProperty"
        :class="index < propertyList.length - 1 ? 'mb-8' : ''"
        :trigger-conditions="property"
        :editable="editable"
        @on-emit-trigger-conditions="
          emit('onPropertyChange', { value: $event, index: index })
        "
        @on-error="
          emit('onError', { value: $event ? $event : '', index: index })
        "
      />
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>

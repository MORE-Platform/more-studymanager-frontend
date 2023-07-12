<script setup lang="ts">
  import { PropType, ref, Ref } from 'vue';
  import {
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
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

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
    (e: 'onCheckErrors'): void;
  }>();

  const triggerConditionError: Ref<string | undefined> = ref('');
  const rowIsOpenError: Ref<string | undefined> = ref('');

  function setTriggerConditionError(triggerTableE?: string) {
    triggerConditionError.value = triggerTableE;
    emit('onError', {
      value: triggerTableE ? triggerTableE : '',
      index: -1,
    });
    emit('onCheckErrors');
  }
  function setRowOpenError(isOpen: boolean) {
    if (isOpen) {
      rowIsOpenError.value = t('intervention.error.interventionRowIsOpen');
      emit('onCheckErrors');
      emit('onError', { value: 'row is open', index: -1 });
    } else {
      rowIsOpenError.value = '';
      emit('onError', { value: '', index: -1 });
    }
  }
</script>

<template>
  <div class="property-inputs" :class="styleModifier">
    <div v-for="(property, index) in propertyList" :key="index">
      <StringPropertyInput
        v-if="property instanceof StringProperty"
        :property="property"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <StringTextPropertyInput
        v-if="property instanceof StringTextProperty"
        :property="property"
        :editable="editable"
        class="col-span-8"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <IntegerPropertyInput
        v-if="property instanceof IntegerProperty"
        :property="property"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <StringListPropertyInput
        v-if="property instanceof StringListProperty"
        :property="property"
        :editable="editable"
        @on-input-change="
          emit('onPropertyChange', { value: $event.value, index: index })
        "
      />

      <CronSchedulerConfiguration
        v-if="property instanceof CronProperty"
        class="col-span-5 mb-4"
        :editable="editable"
        :cron-schedule="property.value"
        @on-valid-schedule="
          emit('onPropertyChange', { value: $event, index: index })
        "
        @on-error="
          emit('onError', { value: $event ? $event : '', index: index })
        "
      />

      <div
        v-if="property instanceof DataCheckProperty"
        class="col-start-0 col-span-6 mt-5"
      >
        <InterventionTriggerConditions
          :error="
            triggerConditionError ? triggerConditionError : rowIsOpenError
          "
          class="mb-5"
          :trigger-conditions="property"
          :editable="editable"
          @on-error="setTriggerConditionError($event)"
          @on-row-open-error="setRowOpenError($event)"
        />
        <div v-if="rowIsOpenError !== ''" class="error my-4">
          {{ rowIsOpenError }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss"></style>

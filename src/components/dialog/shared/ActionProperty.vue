/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { PropType, Ref, ref } from 'vue';
  import { Action, ComponentFactory } from '../../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import { Property } from '../../../models/InputModels';
  import PropertyInputs from './PropertyInputs.vue';
  import { Context } from '../../../models/ContextModel';

  const { t } = useI18n();

  const props = defineProps({
    action: {
      type: Object as PropType<Action>,
      required: true,
    },
    context: {
      type: Object as PropType<Context>,
      required: true,
    },
    actionFactories: {
      type: Array as PropType<Array<ComponentFactory>>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    (e: 'onActionPropChange', action: Action): void;
  }>();

  function getActionDescription(): string {
    return (
      props.actionFactories.find(
        (cf: ComponentFactory) => cf.componentId === props.action.type,
      )?.description || t('intervention.placeholder.noDescription')
    );
  }

  function getActionTitle(): string {
    return (
      props.actionFactories.find(
        (cf: ComponentFactory) => cf.componentId === props.action.type,
      )?.title || t('intervention.placeholder.noDescription')
    );
  }

  function getActionProperties(action: Action): Property<any>[] {
    let actionProperties: Property<any>[] = [];

    const foundElm = props.actionFactories.find(
      (cf: ComponentFactory) => cf.componentId === action.type,
    );

    if (foundElm && foundElm.properties) {
      actionProperties = foundElm.properties
        .map((json: any) => Property.fromJson(json))
        .map((p: Property<any>) => p.setValue(action.properties?.[p.id]));
    }

    return actionProperties;
  }

  const actionProperties: Ref<Property<any>[]> = ref(
    getActionProperties(props.action),
  );

  function getActionPropsParsed(actionProps: Property<any>[]): any {
    return Property.toJson(actionProps);
  }

  function updateProperty(prop: Property<any>, i: number): void {
    actionProperties.value[i].value = prop;

    if (actionProperties.value) {
      const returnAction: Action = { ...props.action };
      returnAction.properties = getActionPropsParsed(actionProperties.value);
      emit('onActionPropChange', returnAction);
    }
  }
</script>

<template>
  <div class="action-property-input grid grid-cols-5 gap-4">
    <div class="col-span-5">
      <h6 class="color-primary font-bold">
        {{ $t(getActionTitle()) }}
      </h6>
      <div>{{ $t(getActionDescription()) }}</div>
    </div>

    <div v-if="actionProperties" class="col-span-5">
      <PropertyInputs
        :editable="editable"
        :property-list="actionProperties"
        :context="context"
        @on-property-change="updateProperty($event.value, $event.index)"
      />
    </div>
  </div>
</template>

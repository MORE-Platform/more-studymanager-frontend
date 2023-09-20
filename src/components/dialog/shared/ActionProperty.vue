<script setup lang="ts">
  import { PropType, Ref, ref } from 'vue';
  import { Action, ComponentFactory } from '../../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import { Property } from '../../../models/InputModels';
  import PropertyInputs from './ProprtyInputs.vue';
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

  function getActionDescription(actionType?: string) {
    return (
      props.actionFactories.find(
        (a: ComponentFactory) => a.componentId === actionType
      )?.description || t('intervention.placeholder.noDescription')
    );
  }

  function getActionTitle(actionType?: string) {
    return (
      props.actionFactories.find(
        (a: ComponentFactory) => a.componentId === actionType
      )?.title || t('intervention.placeholder.noDescription')
    );
  }

  function getActionProperties(action: Action): any {
    const properties: Property<any>[] | undefined = props.actionFactories
      .find((factory: ComponentFactory) => factory.componentId === action.type)
      ?.properties?.map((json: any) => Property.fromJson(json))
      .map((p: Property<any>) => p.setValue(action.properties?.[p.id]));
    return properties;
  }

  const actionObj: Ref<Action> = ref(props.action);
  const actionProperties: Ref<Property<any>[] | undefined> = ref(
    getActionProperties(props.action)
  );

  function getActionPropsParsed(actionProps: Property<any>[]): any {
    return Property.toJson(actionProps);
  }

  function updateProperty(prop: Property<any>, i: number) {
    //@ts-ignore
    actionProperties.value[i].value = prop;

    if (actionProperties.value) {
      const returnAction: Ref<Action> = ref(props.action);
      returnAction.value.properties = getActionPropsParsed(
        actionProperties.value
      );

      emit('onActionPropChange', returnAction.value);
    }
  }
</script>

<template>
  <div class="action-property-input grid grid-cols-5 gap-4">
    <div class="col-span-5">
      <h6 class="color-primary font-bold">
        {{ $t(getActionTitle(actionObj.type)) }}
      </h6>
      <div>{{ $t(getActionDescription(actionObj.type)) }}</div>
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

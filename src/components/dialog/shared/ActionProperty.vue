<script setup lang="ts">
  import { PropType, Ref, ref } from 'vue';
  import { Action, ComponentFactory } from '../../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import { Property, StringProperty } from '../../../models/InputModels';
  import StringPropertyInput from './StringPropertyInput.vue';

  const { t } = useI18n();

  const props = defineProps({
    action: {
      type: Object as PropType<Action>,
      required: true,
    },
    actionFactories: {
      type: Array as PropType<Array<ComponentFactory>>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
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
    const properties: any = Property.toJson(actionProps);
    return properties;
  }

  function updateProperty(prop: StringProperty, i: number) {
    //@ts-ignore
    actionProperties.value[i] = prop;

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
  <div class="action-property-input grid grid-cols-6 gap-4">
    <div class="col-span-6">
      <h6>
        {{ $t('intervention.dialog.label.pushNotification') }}
      </h6>
      <div>{{ $t(getActionDescription(actionObj.type)) }}</div>
    </div>

    <div
      v-for="(property, index) in actionProperties"
      :key="index"
      class="col-span-3"
    >
      <StringPropertyInput
        v-if="property instanceof StringProperty"
        :property="property"
        :editable="editable"
        class="col-span-4"
        @on-input-change="updateProperty($event, index)"
      />
    </div>
  </div>
</template>

/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { ObservationProperty } from '../../../models/InputModels';
  import { PropType, ref, Ref, watch } from 'vue';
  import { useObservationsApi } from '../../../composable/useApi';
  import { Observation } from '../../../generated-sources';
  import { AxiosResponse } from 'axios';
  import Dropdown from 'primevue/dropdown';
  import { Context } from '../../../models/ContextModel';
  import { useI18n } from 'vue-i18n';
  import ExclamationIcon from '../../../components/shared/ExclamationIcon.vue';

  const { t } = useI18n();

  const props = defineProps({
    property: {
      type: Object as PropType<ObservationProperty>,
      required: true,
    },
    context: {
      type: Object as PropType<Context>,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  });

  const { observationsApi } = useObservationsApi();
  const observationList: Ref<Observation[]> = ref([]);
  const observation: Ref<Observation | undefined> = ref();

  observationsApi
    .listObservations(props.context.studyId)
    .then((response: AxiosResponse) => {
      // TODO filter for group
      observationList.value = response.data.filter((o: Observation) => {
        if (props.context?.groupId) {
          // eslint-disable-next-line
          return props.context?.groupId == o.studyGroupId;
        } else {
          return true;
        }
      });
      // set current observation
      observation.value = observationList.value.find(
        (observation) =>
          props.property?.value?.id === observation.observationId &&
          props.property?.value?.factory === observation.type,
      );
    });

  const emit = defineEmits<{
    (
      e: 'onInputChange',
      observationProperty: {
        factory: string;
        id: number;
      },
    ): void;
  }>();

  watch(observation, (value) => {
    emit('onInputChange', { id: value!.observationId!, factory: value!.type! });
  });
</script>

<template>
  <div class="flex flex-col gap-1">
    <h6 class="font-bold">
      <label v-if="property.name" :for="property.id" class="flex flex-row gap-1.5 justify-start align-center" >
        <span v-if="!observation && property.value?.id" class="warning-icon">
          <ExclamationIcon id="exclamationIcon" />
        </span>
        {{ $t(property.name) }}<span v-if="property.required">*</span>
      </label>
    </h6>
    <div
      v-if="!observation && property.value?.id"
      class="error col-span-8 mb-4"
    >
      {{ t('intervention.error.observationDeleted', { observationId: property.value?.id, observationType: property.value?.factory}) }}
    </div>
    <Dropdown
      :id="property.id"
      v-model="observation"
      :options="observationList"
      option-label="title"
      class="w-full"
      :required="property.required"
      :aria-describedby="`${property.id}-help`"
      :disabled="!editable"
      :placeholder="$t(props.property.description)"
    />
  </div>
</template>

<style scoped lang="postcss">
  .warning-icon #exclamationIcon {
    height: 20px;
    width: auto;
  }
</style>

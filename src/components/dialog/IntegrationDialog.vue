/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import {
    ComponentFactory,
    Observation,
    StudyStatus,
  } from '../../generated-sources/openapi';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import { useStudyStore } from '../../stores/studyStore';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import Button from 'primevue/button';

  const studyStore = useStudyStore();
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const observationList: Observation[] =
    dialogRef.value.data?.observationList || [];
  const factories: ComponentFactory[] = dialogRef.value.data?.factories || [];

  const observationValues: MoreTableChoice[] = observationList.map(
    (observation) => {
      return {
        label: `${observation.title} (${getObservationName(observation.type as string)})`,
        value: observation.observationId?.toString() || null,
      } as MoreTableChoice;
    },
  );

  function getObservationName(type: string): string {
    return t(factories.find((f) => type === f.componentId)?.title as string);
  }

  const selectedObservation: Ref<number | null> = ref(null);
  const tokenLabel: Ref<string> = ref('');

  const editable = studyStore.study.status !== StudyStatus.Closed;

  const errors: Ref<Array<MoreTableChoice>> = ref([]);

  function checkErrors(): void {
    errors.value = [];
    if (!tokenLabel.value) {
      errors.value.push({
        label: 'tokenLabel',
        value: t('integration.error.addTokenLabel'),
      } as MoreTableChoice);
    }
    if (!selectedObservation.value) {
      errors.value.push({
        label: 'selectedObservation',
        value: t('integration.error.selectObservation'),
      } as MoreTableChoice);
    }
  }

  function getError(label: string): string | null | undefined {
    return errors.value.find((el) => el.label === label)?.value;
  }

  function save(): void {
    dialogRef.value.close({
      observationId: selectedObservation.value,
      tokenLabel: tokenLabel.value,
    });
  }

  function cancel(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog integration-dialog">
    <div class="mb-2">
      <h6 class="mb-4">{{ $t('integration.dialog.label.description') }}</h6>

      <form
        id="interventionDialogForm"
        class="grid grid-cols-8 items-center gap-4"
        :class="{ 'gap-y-2': !editable }"
        @submit.prevent="save()"
      >
        <div class="col-start-0 col-span-8" :class="{ 'pb-4': !editable }">
          <h5 class="my-1 text-base font-bold">
            {{ $t('integration.dialog.label.integrationTitle') }}
          </h5>

          <div v-if="!tokenLabel" class="error col-span-8 mb-2">
            {{ getError('tokenLabel') }}
          </div>

          <InputText
            v-model="tokenLabel"
            class="w-full"
            type="text"
            required
            :placeholder="$t('integration.dialog.placeholder.tokenLabelInput')"
            :disabled="!editable"
          ></InputText>
        </div>
        <div class="col-start-0 col-span-8">
          <h5 class="mb-0.5 mt-1 text-base font-bold">
            {{ $t('integration.dialog.label.chooseObservation') }}
          </h5>
          <div class="mb-2">
            {{ $t('integration.dialog.label.chooseObservationDesc') }}
          </div>

          <div v-if="!selectedObservation" class="error col-span-8 mb-2">
            {{ getError('selectedObservation') }}
          </div>

          <Dropdown
            v-model="selectedObservation"
            class="w-full"
            :options="observationValues"
            :name="'observation'"
            option-label="label"
            option-value="value"
            :placeholder="t('integration.dialog.placeholder.selectObservation')"
          />
        </div>

        <div
          class="buttons col-start-0 col-span-8 mt-1 justify-end text-right align-bottom"
        >
          <Button
            class="btn-gray"
            :label="$t('global.labels.cancel')"
            @click="cancel()"
          />
          <Button
            class="!ml-2"
            type="submit"
            :label="$t('global.labels.save')"
            @click="checkErrors()"
          />
        </div>
      </form>
    </div>
  </div>
</template>

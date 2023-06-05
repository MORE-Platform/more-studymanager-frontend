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

  const observationValues: MoreTableChoice[] = observationList.map((item) => {
    return {
      label: (item.title + getObservationName(item.type as string)) as string,
      value: item.observationId?.toString() || null,
    };
  });

  function getObservationName(type: string): string {
    return (
      ' (' + factories.find((item) => type === item.componentId)?.title + ')'
    );
  }

  const selectedObservation: Ref<MoreTableChoice | null> = ref(null);
  const tokenLabel: Ref<string> = ref('');

  const editable =
    studyStore.study.status === StudyStatus.Draft ||
    studyStore.study.status === StudyStatus.Paused;

  const errors: Ref<Array<MoreTableChoice>> = ref([]);

  function checkErrors() {
    errors.value = [];
    if (!tokenLabel.value) {
      errors.value.push({
        label: 'tokenLabel',
        value: t('integration.error.addTokenLabel'),
      });
    }
    if (!selectedObservation.value) {
      errors.value.push({
        label: 'selectedObservation',
        value: t('integration.error.selectObservation'),
      });
    }
  }

  function getError(label: string): string | null | undefined {
    const item = errors.value.find((el) =>
      el.label === label ? el.value : ''
    );
    return item?.value;
  }

  function save() {
    dialogRef.value.close({
      observationId: selectedObservation.value,
      tokenLabel: tokenLabel.value,
    });
  }

  function cancel() {
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
        :class="editable ? '' : 'gap-y-2'"
        @submit.prevent="save()"
      >
        <div class="col-start-0 col-span-8" :class="editable ? '' : 'pb-4'">
          <h5 class="mb-1 mt-1">
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
            style="width: 100%"
            :disabled="!editable"
          ></InputText>
        </div>
        <div class="col-start-0 col-span-8">
          <h5 class="mb-0.5 mt-1">
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
            style="width: 100%"
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
          <Button class="btn-gray" @click="cancel()">{{
            $t('global.labels.cancel')
          }}</Button>
          <Button type="submit" @click="checkErrors()">{{
            $t('global.labels.save')
          }}</Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .buttons {
    button {
      margin-left: 10px;
    }
  }
  h5 {
    font-size: 18px;
    font-weight: bold;
  }
</style>

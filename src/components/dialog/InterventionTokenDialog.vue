/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import { Intervention } from '@gs';
  import { useI18n } from 'vue-i18n';
  import { MoreTableChoice } from '../../models/MoreTableModel';
  import InputText from 'primevue/inputtext';
  import Dropdown from 'primevue/dropdown';
  import Button from 'primevue/button';

  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const interventionList: Intervention[] =
    dialogRef.value.data?.interventionList || [];

  const interventionValues: MoreTableChoice[] = interventionList.map(
    (intervention) => {
      return {
        label: `${intervention.title} (ID: ${intervention.interventionId})`,
        value: intervention.interventionId?.toString() || null,
      } as MoreTableChoice;
    },
  );

  const selectedIntervention: Ref<number | null> = ref(
    interventionList.length === 1
      ? (interventionList[0].interventionId ?? null)
      : null,
  );
  const tokenLabel: Ref<string> = ref('');

  const errors: Ref<Array<MoreTableChoice>> = ref([]);

  function checkErrors(): void {
    errors.value = [];
    if (!tokenLabel.value) {
      errors.value.push({
        label: 'tokenLabel',
        value: t('interventionToken.dialog.placeholder.tokenLabelInput'),
      } as MoreTableChoice);
    }
    if (!selectedIntervention.value) {
      errors.value.push({
        label: 'selectedIntervention',
        value: t('interventionToken.dialog.placeholder.selectIntervention'),
      } as MoreTableChoice);
    }
  }

  function getError(label: string): string | null | undefined {
    return errors.value.find((el) => el.label === label)?.value;
  }

  function save(): void {
    checkErrors();
    if (errors.value.length) return;
    dialogRef.value.close({
      interventionId: selectedIntervention.value,
      tokenLabel: tokenLabel.value,
    });
  }

  function cancel(): void {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="dialog intervention-token-dialog">
    <div class="mb-2">
      <form
        class="grid grid-cols-8 items-center gap-4"
        @submit.prevent="save()"
      >
        <div class="col-start-0 col-span-8">
          <h5 class="my-1 text-base font-bold">
            {{ $t('interventionToken.dialog.label.tokenLabel') }}
          </h5>

          <div v-if="!tokenLabel" class="error col-span-8 mb-2">
            {{ getError('tokenLabel') }}
          </div>

          <InputText
            v-model="tokenLabel"
            class="w-full"
            type="text"
            required
            :placeholder="$t('interventionToken.dialog.placeholder.tokenLabelInput')"
          ></InputText>
        </div>
        <div class="col-start-0 col-span-8">
          <h5 class="mb-0.5 mt-1 text-base font-bold">
            {{ $t('interventionToken.dialog.label.chooseIntervention') }}
          </h5>

          <div v-if="!selectedIntervention" class="error col-span-8 mb-2">
            {{ getError('selectedIntervention') }}
          </div>

          <Dropdown
            v-model="selectedIntervention"
            class="w-full"
            :options="interventionValues"
            :name="'intervention'"
            option-label="label"
            option-value="value"
            :placeholder="t('interventionToken.dialog.placeholder.selectIntervention')"
          />
        </div>

        <div
          class="buttons col-start-0 col-span-8 mt-1 flex flex-row items-center justify-end"
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
          />
        </div>
      </form>
    </div>
  </div>
</template>

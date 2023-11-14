/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 * Foerderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import { StudyRole } from '../../generated-sources/openapi';
  import MultiSelect from 'primevue/multiselect';
  import {
    MoreTableChoice,
    MoreTableCollaboratorItem,
  } from '../../models/MoreTableModel';
  import Button from 'primevue/button';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const collaborator: MoreTableCollaboratorItem =
    dialogRef.value.data?.collaborator || {};
  const roleList: StudyRole[] = dialogRef.value.data?.roleList || [
    { label: t('studyCollaborator.dialog.emptyDropdownValues'), value: null },
  ];
  const placeholder: string =
    dialogRef.value.data?.placeholder ||
    t('global.placeholder.chooseDropdownOptionDefault');
  const roleValues: Ref<MoreTableChoice[]> = ref([]);
  const warning: Ref<string | undefined> = ref(undefined);

  function save() {
    if (!roleValues.value.length) {
      warning.value = t('studyCollaborator.dialog.addRole');
    } else {
      const returnCollaborator: MoreTableCollaboratorItem = {
        uid: collaborator.uid,
        name: collaborator.name,
        institution: collaborator.institution,
        roles: roleValues.value,
      };
      warning.value = undefined;
      dialogRef.value.close(returnCollaborator);
    }
  }

  function cancel() {
    dialogRef.value.close();
  }
</script>

<template>
  <div class="study-collaborator-dialog">
    <div class="mb-4">
      <span class="font-bold"
        >{{ collaborator.name }} ({{ collaborator.institution }})
      </span>
      {{ $t('studyCollaborator.dialog.addCollaboratorInfo') }}
    </div>

    <h6 class="mb-2">{{ $t('studyCollaborator.dialog.chooseRoles') }}</h6>
    <div v-if="warning" class="error mb-3">{{ warning }}</div>
    <MultiSelect
      v-model="roleValues"
      :options="roleList"
      option-label="label"
      :placeholder="placeholder"
      :show-toggle-all="false"
      :class="'w-1/4'"
      class="radio"
      :selection-limit="1"
    />

    <div class="buttons mt-1 justify-end text-right">
      <Button class="btn-gray" @click="cancel()">{{
        $t('global.labels.cancel')
      }}</Button>
      <Button @click="save()">{{ $t('global.labels.save') }}</Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .buttons button:first-of-type {
    margin-right: 10px;
  }

  :deep(.p-checkbox .p-checkbox-box) {
    border-radius: 50% !important;
  }
</style>

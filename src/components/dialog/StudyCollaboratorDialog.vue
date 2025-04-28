/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import RadioButton from 'primevue/radiobutton';
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
  const roleList: MoreTableChoice[] = dialogRef.value.data?.roleList;
  const roleValue: Ref<MoreTableChoice | undefined> = ref();
  const warning: Ref<string | undefined> = ref(undefined);

  function save(): void {
    if (!roleValue.value) {
      warning.value = t('studyCollaborator.dialog.addRole');
    } else {
      const returnCollaborator: MoreTableCollaboratorItem = {
        uid: collaborator.uid,
        name: collaborator.name,
        institution: collaborator.institution,
        roles: [roleValue.value],
      };
      warning.value = undefined;
      dialogRef.value.close(returnCollaborator);
    }
  }

  function cancel(): void {
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
    <div v-for="role in roleList" :key="role.value!" class="flex">
      <RadioButton
        v-model="roleValue"
        name="roles"
        :input-id="role.value!"
        :value="role"
      ></RadioButton>
      <label :for="role.value!" class="-mt-1">{{ role.label }}</label>
    </div>

    <div class="buttons mt-1 flex flex-row items-center justify-end">
      <Button
        class="btn-gray"
        :label="$t('global.labels.cancel')"
        @click="cancel()"
      />
      <Button class="!ml-2" :label="$t('global.labels.save')" @click="save()" />
    </div>
  </div>
</template>

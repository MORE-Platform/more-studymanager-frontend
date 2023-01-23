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

  const dialogRef: any = inject('dialogRef');
  const collaborator: MoreTableCollaboratorItem =
    dialogRef.value.data?.collaborator || {};
  const roleList: StudyRole[] = dialogRef.value.data?.roleList || [
    { label: 'Currently are no roles available', value: null },
  ];
  const placeholder: string =
    dialogRef.value.data?.placeholder || 'Choose Option';
  const roleValues: Ref<MoreTableChoice[]> = ref([]);
  const warning: Ref<string | undefined> = ref(undefined);
  const { t } = useI18n();

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
      :placeholder="$t(placeholder)"
      :show-toggle-all="false"
    >
    </MultiSelect>

    <div class="buttons mt-8 justify-end text-right">
      <Button class="p-button-secondary" @click="cancel()">{{
        $t('global.dialog.cancel')
      }}</Button>
      <Button @click="save()">{{ $t('global.dialog.save') }}</Button>
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .buttons button:first-of-type {
    margin-right: 10px;
  }
</style>

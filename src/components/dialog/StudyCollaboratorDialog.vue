<script setup lang="ts">
  import { inject, ref, Ref } from 'vue';
  import { StudyRole } from '../../generated-sources/openapi';
  import MultiSelect from 'primevue/multiselect';
  import {
    MoreTableChoice,
    MoreTableCollaboratorItem,
  } from '../../models/MoreTableModel';
  import Button from 'primevue/button';

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

  function save() {
    if (!roleValues.value.length) {
      warning.value = 'Please choose at least one role to continue or cancel.';
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
      Add
      <span class="font-bold"
        >{{ collaborator.name }} ({{ collaborator.institution }})
      </span>
      to your study collaborators.
    </div>

    <h6>Choose your calloberator's roles:</h6>
    <div v-if="warning" class="error mb-3">{{ warning }}</div>
    <MultiSelect
      v-model="roleValues"
      :options="roleList"
      option-label="label"
      :placeholder="$t(placeholder)"
    ></MultiSelect>

    <div class="buttons mt-8 justify-end text-right">
      <Button class="p-button-secondary" @click="cancel()">Cancel</Button>
      <Button @click="save()">Save</Button>
    </div>
  </div>
</template>

<style lang="postcss"></style>

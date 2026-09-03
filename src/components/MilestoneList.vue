/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see
https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import { PropType, ref } from 'vue';
  import { Milestone, StudyStatus } from '@gs';
  import { useI18n } from 'vue-i18n';
  import { useDialog } from 'primevue/usedialog';
  import DynamicDialog from 'primevue/dynamicdialog';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import OrderList from 'primevue/orderlist';
  import { useMilestoneStore } from '@/stores/milestoneStore';
  import DeleteMoreTableRowDialog from './dialog/DeleteMoreTableRowDialog.vue';

  const { t } = useI18n();
  const dialog = useDialog();
  const milestoneStore = useMilestoneStore();

  const props = defineProps({
    studyId: {
      type: Number,
      required: true,
    },
    studyStatus: {
      type: String as PropType<StudyStatus>,
      required: true,
    },
  });

  const actionsVisible =
    props.studyStatus === StudyStatus.Draft ||
    props.studyStatus === StudyStatus.Paused ||
    props.studyStatus === StudyStatus.PausedPreview;

  const newMilestoneName = ref('');

  function addMilestone(): void {
    const name = newMilestoneName.value.trim();
    if (!name) return;
    milestoneStore.createMilestone(props.studyId, name);
    newMilestoneName.value = '';
  }

  const editingId = ref<number | undefined>(undefined);
  const editingName = ref('');

  function startEdit(milestone: Milestone): void {
    editingId.value = milestone.milestoneId;
    editingName.value = milestone.name;
  }

  function cancelEdit(): void {
    editingId.value = undefined;
    editingName.value = '';
  }

  function saveEdit(milestone: Milestone): void {
    const name = editingName.value.trim();
    if (name && name !== milestone.name) {
      milestoneStore.updateMilestone({ ...milestone, name });
    }
    cancelEdit();
  }

  function reorder(newOrder: Milestone[]): void {
    milestoneStore.reorderMilestones(newOrder);
  }

  function confirmDelete(milestone: Milestone): void {
    dialog.open(DeleteMoreTableRowDialog, {
      data: {
        introMsg: t('milestone.dialog.deleteMsg.intro'),
        warningMsg: t('milestone.dialog.deleteMsg.warning'),
        confirmMsg: t('milestone.dialog.deleteMsg.confirm'),
        row: milestone,
        elTitle: milestone.name,
        onDelete: (row: Milestone) => milestoneStore.deleteMilestone(row),
      },
      props: {
        header: t('milestone.dialog.header.delete'),
        style: { width: '50vw' },
        breakpoints: { '960px': '75vw', '640px': '90vw' },
        modal: true,
        draggable: false,
      },
    });
  }
</script>

<template>
  <div class="milestone-list">
    <h4 class="mb-1 text-lg font-bold">{{ t('milestone.plural') }}</h4>
    <p class="mb-4">{{ t('milestone.list.description') }}</p>

    <div v-if="actionsVisible" class="mb-4 flex items-end gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-bold text-gray-400 uppercase">{{
          t('milestone.singular')
        }}</label>
        <InputText
          v-model="newMilestoneName"
          :placeholder="t('milestone.placeholder.name')"
          @keyup.enter="addMilestone"
        />
      </div>
      <Button
        type="button"
        icon="pi pi-plus"
        :label="t('milestone.dialog.header.create')"
        :disabled="!newMilestoneName.trim()"
        @click="addMilestone"
      />
    </div>

    <div
      v-if="milestoneStore.milestones.length === 0"
      class="py-2 text-sm text-gray-500 italic"
    >
      {{ t('milestone.list.empty') }}
    </div>
    <OrderList
      v-else-if="actionsVisible"
      :model-value="milestoneStore.milestones"
      data-key="milestoneId"
      list-style="max-height: none"
      :striped-rows="true"
      @update:model-value="reorder"
    >
      <template #option="{ option, index }">
        <div class="flex w-full items-center gap-2 py-1">
          <span class="w-6 shrink-0 text-right text-sm text-gray-400">{{
            index + 1
          }}</span>
          <div
            v-if="editingId === option.milestoneId"
            class="flex flex-1 items-center gap-2"
          >
            <InputText
              v-model="editingName"
              class="flex-1"
              autofocus
              @keydown.stop
              @keyup.enter="saveEdit(option)"
              @keyup.esc="cancelEdit"
            />
            <Button
              type="button"
              icon="pi pi-check"
              class="p-button-text"
              @click.stop="saveEdit(option)"
            />
            <Button
              type="button"
              icon="pi pi-times"
              class="p-button-text btn-gray"
              @click.stop="cancelEdit"
            />
          </div>
          <div v-else class="flex flex-1 items-center justify-between">
            <span>{{ option.name }}</span>
            <div class="flex items-center gap-1">
              <Button
                type="button"
                icon="pi pi-pencil"
                class="p-button-text"
                @click.stop="startEdit(option)"
              />
              <Button
                type="button"
                icon="pi pi-trash"
                class="p-button-text btn-important"
                @click.stop="confirmDelete(option)"
              />
            </div>
          </div>
        </div>
      </template>
    </OrderList>
    <ul v-else class="list-none">
      <li
        v-for="(milestone, index) in milestoneStore.milestones"
        :key="milestone.milestoneId"
        class="border-b py-2"
      >
        <span class="mr-2 text-sm text-gray-400">{{ index + 1 }}</span
        >{{ milestone.name }}
      </li>
    </ul>
    <DynamicDialog />
  </div>
</template>

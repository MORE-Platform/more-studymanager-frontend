<script setup lang="ts">
  import Popover from 'primevue/popover';
  import Button from 'primevue/button';
  import InputText from 'primevue/inputtext';
  import { ref, computed, PropType } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps({
    buttonLabel: {
      type: String,
      required: true,
    },
    isButtonDisabled: {
      type: Boolean,
      default: false,
    },
    dropdownList: {
      type: Array as PropType<
        Array<{ label: string; value: any; description: string }>
      >,
      required: true,
    },
    searchFieldPlaceholder: {
      type: String,
      default: undefined,
    },
    buttonIcon: {
      type: String,
      default: undefined,
    },
    panelWidthClass: {
      type: String,
      default: '40vw',
    },
  });

  const overlayPanel = ref<InstanceType<typeof Popover> | null>(null);
  const query = ref('');

  const filteredDropdownList = computed(() => {
    const q = query.value.trim().toLowerCase();
    return props.dropdownList.filter((item) =>
      item.label.toLowerCase().includes(q),
    );
  });

  const toggleOverlay = (event: MouseEvent): void => {
    overlayPanel.value?.toggle(event);
  };

  const emit = defineEmits<{
    (
      e: 'onSelectOption',
      objectId: { label: string; value: any; description: string },
    ): void;
    (e: 'onQueryChange', query: string): void;
  }>();
</script>

<template>
  <div>
    <Button
      type="button"
      class="flex w-full items-center justify-between text-nowrap"
      :disabled="isButtonDisabled"
      @click="toggleOverlay($event)"
    >
      <span>
        <span v-if="buttonIcon" :class="[buttonIcon, 'mr-3']" />
        {{ buttonLabel }}
      </span>
      <span class="pi pi-angle-down ml-3" />
    </Button>

    <Popover ref="overlayPanel" :class="['w-[50vw] min-w-lg', panelWidthClass]">
      <InputText
        v-model="query"
        class="mb-3 w-full"
        :placeholder="
          searchFieldPlaceholder
            ? searchFieldPlaceholder
            : t('global.labels.searchPlaceholder')
        "
        @value-change="emit('onQueryChange', query)"
      />

      <div class="scrollbar-stable max-h-[38vh] overflow-y-auto">
        <button
          v-for="dropdownItem in filteredDropdownList"
          :key="dropdownItem.label"
          type="button"
          class="w-full px-3 py-2 text-left hover:bg-gray-50"
          @click="emit('onSelectOption', dropdownItem)"
        >
          <div class="font-medium">{{ dropdownItem.label }}</div>
          <div class="text-sm opacity-70">
            <!-- eslint-disable vue/no-v-html -->
            <span v-html="dropdownItem.description" />
          </div>
        </button>

        <div
          v-if="filteredDropdownList.length === 0"
          class="px-3 py-2 text-sm opacity-70"
        >
          {{ t('studyCollaborator.placeholder.noResultsFound') }}
        </div>
      </div>
    </Popover>
  </div>
</template>

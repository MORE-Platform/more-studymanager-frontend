<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    modelValue: boolean;
    editable?: boolean;
    changeable?: boolean;
    infoText?: string;
    label?: string;
    enabledIcon: string;
    disabledIcon: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: true,
    changeable: true,
    infoText: '',
    label: undefined,
  });

  const isInteractive = computed(() => props.editable && props.changeable);

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  function toggleValue(): void {
    if (isInteractive.value) {
      emit('update:modelValue', !props.modelValue);
    }
  }
</script>

<template>
  <div
    class="info-box relative flex cursor-pointer flex-row items-center"
    :class="{ 'cursor-not-allowed': !isInteractive }"
  >
    <div v-if="isInteractive" class="flex items-center" @click="toggleValue">
      <div class="icon-box reminder">
        <span
          class="pi cursor-pointer"
          :class="modelValue ? `${enabledIcon}` : `${disabledIcon}`"
        />
      </div>
    </div>
    <div v-else class="icon-box reminder preview">
      <span
        class="pi"
        :class="
          modelValue
            ? `${enabledIcon} color-approved`
            : `${disabledIcon} color-important`
        "
      />
    </div>
    <span v-if="label" class="ml-2 inline">
      <slot name="label">
        {{ label }}
      </slot>
    </span>
    <i
      class="pi pi-info-circle color-primary mx-1"
      :class="{ 'me-2': isInteractive }"
    />
    <div
      v-if="infoText"
      class="info-box-hidden pointer-events-none absolute bottom-full bg-white p-5 text-center opacity-0"
    >
      {{ infoText }}
    </div>
  </div>
</template>

<style scoped lang="postcss">
  .info-box {
    &-hidden {
      width: max-content;
      max-width: 300px;
      border: 1px solid var(--bluegray-200);
      transition: ease-in-out opacity 0.25s;
      box-shadow: 1px 1px 5px var(--bluegray-200);
      left: 0;
      white-space: normal;
      z-index: 100000;
      margin-bottom: 0.5rem;
    }

    &:hover {
      .info-box-hidden {
        opacity: 1;
      }
    }
  }

  .icon-box.reminder {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--surface-100);
    }

    .pi {
      font-size: 1.25rem;
    }
  }

  .icon-box.reminder.preview {
    cursor: default;

    &:hover {
      background-color: transparent;
    }
  }
</style>

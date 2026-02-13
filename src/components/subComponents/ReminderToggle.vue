<script setup lang="ts">
  interface Props {
    modelValue: boolean;
    editable?: boolean;
    infoText?: string;
    label?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: true,
    infoText: '',
    label: undefined,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  function toggleReminder(): void {
    if (props.editable) {
      emit('update:modelValue', !props.modelValue);
    }
  }
</script>

<template>
  <div
    class="info-box relative flex cursor-pointer flex-row items-center"
    :class="{ 'cursor-not-allowed': !editable }"
  >
    <div v-if="editable" class="flex items-center" @click="toggleReminder">
      <div class="icon-box reminder">
        <span
          class="pi cursor-pointer"
          :class="modelValue ? 'pi-bell' : 'pi-bell-slash'"
        />
      </div>
    </div>
    <div v-else class="icon-box reminder preview">
      <span
        class="pi"
        :class="
          modelValue
            ? 'pi-bell color-approved'
            : 'pi-bell-slash color-important'
        "
      />
    </div>
    <div v-if="infoText" class="inline">
      <div
        class="info-box-hidden pointer-events-none absolute bottom-full right-0 bg-white p-5 text-center opacity-0"
      >
        {{ infoText }}
      </div>
    </div>
    <span v-if="label" class="ml-2 inline">
      <slot name="label">
        {{ label }}
      </slot>
    </span>
    <i
      class="pi pi-info-circle color-primary mx-1"
      :class="{ 'me-2': editable }"
    />
  </div>
</template>

<style scoped lang="postcss">
  .info-box {
    &-hidden {
      width: 20vw;
      border: 1px solid var(--bluegray-200);
      transition: ease-in-out opacity 0.25s;
      box-shadow: 1px 1px 5px var(--bluegray-200);
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

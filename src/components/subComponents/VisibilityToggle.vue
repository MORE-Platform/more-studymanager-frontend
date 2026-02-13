<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    modelValue: boolean;
    editable?: boolean;
    changeable?: boolean;
    infoText?: string;
    label?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    editable: true,
    changeable: true,
    infoText: '',
    label: undefined,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const isInteractive = computed(() => props.editable && props.changeable);

  function toggleVisibility(): void {
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
    <div v-if="isInteractive" class="flex items-center">
      <div class="icon-box eye">
        <span
          class="pi cursor-pointer"
          :class="modelValue ? 'pi-eye-slash' : 'pi-eye'"
          @click="toggleVisibility"
        />
      </div>
    </div>
    <div v-else class="icon-box eye preview">
      <span
        class="pi"
        :class="
          modelValue ? 'pi-eye color-approved' : 'pi-eye-slash color-important'
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
      :class="{ 'me-2': isInteractive }"
    />
  </div>
</template>

<style scoped lang="postcss">
  @import '../../styles/components/eye-checkbox.pcss';

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
</style>

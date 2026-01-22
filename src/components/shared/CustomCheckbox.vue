<script setup lang="ts">
  import { ref } from 'vue'

  type Props = {
    modelValue: boolean
    disabled?: boolean
    invalid?: boolean
    name?: string
    value?: string | number
  }

  withDefaults(defineProps<Props>(), {
    disabled: false,
    invalid: false,
    name: '',
    value: ''
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', v: boolean): void
    (e: 'change', v: boolean): void
  }>()

  const isFocused = ref(false)

  function onChange(e: Event): void {
    const next = (e.target as HTMLInputElement).checked
    emit('update:modelValue', next)
    emit('change', next)
  }
</script>

<template>
  <label
    class="rl-check"
    :class="{
      'is-disabled': disabled,
      'is-checked': modelValue,
      'is-invalid': invalid,
    }"
  >
    <span class="rl-check-input">
      <input
        class="rl-check-native"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :name="name"
        :value="value"
        :aria-invalid="invalid ? 'true' : undefined"
        @change="onChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <span class="rl-check-box" :class="{ 'is-focused': isFocused }">
        <svg
          v-if="modelValue"
          class="rl-check-icon"
          viewBox="0 0 14 14"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M5.6 10.6 2.3 7.3l1-1 2.3 2.3 6-6 1 1-7 7z"
            fill="currentColor"
          />
        </svg>
      </span>
    </span>

    <span v-if="$slots.default" class="rl-check-label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
  /* ---- tokens (easy to tweak) ---- */
  .rl-check {
    --rl-size: 20px;
    --rl-radius: 6px;
    --rl-border: var(--surface-400);
    --rl-bg: #ffffff;
    --rl-fg: var(--gray-500);
    --rl-accent: var(--primary-color);
    --rl-accent-contrast: #ffffff;
    --rl-focus: var(--primary-100--alpha);
    --rl-invalid: var(--red-700);
    --rl-disabled-opacity: 0.55;

    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
    color: var(--rl-fg);
  }

  .rl-check.is-disabled {
    cursor: not-allowed;
    opacity: var(--rl-disabled-opacity);
  }

  .rl-check-input {
    position: relative;
    display: inline-flex;
    width: var(--rl-size);
    height: var(--rl-size);
    flex: 0 0 var(--rl-size);
  }

  /* Native input stays accessible, but visually hidden */
  .rl-check-native {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  .rl-check-box {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border: 1px solid var(--rl-border);
    border-radius: var(--rl-radius);
    background: var(--rl-bg);
    transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
  }

  /* Checked */
  .rl-check.is-checked .rl-check-box {
    background: var(--rl-accent);
    border-color: var(--rl-accent);
  }

  .rl-check-icon {
    width: 14px;
    height: 14px;
    color: var(--rl-accent-contrast);
  }

  /* Focus ring */
  .rl-check-box.is-focused {
    box-shadow: 0 0 0 4px var(--rl-focus);
  }

  /* Invalid state */
  .rl-check.is-invalid .rl-check-box {
    border-color: var(--rl-invalid);
  }
  .rl-check.is-invalid.is-checked .rl-check-box {
    background: var(--rl-invalid);
    border-color: var(--rl-invalid);
  }

  /* Label */
  .rl-check-label {
    line-height: 1.2;
  }
</style>

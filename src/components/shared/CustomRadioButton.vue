<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { MoreTableChoice } from '../../models/MoreTableModel'

  type RadioPrimitive = string | number | boolean
  type RadioValue = RadioPrimitive | MoreTableChoice
  type ModelValue = RadioValue | null | undefined

  type Props = {
    modelValue?: ModelValue
    value: RadioValue
    name: string
    disabled?: boolean
    invalid?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    invalid: false,
    modelValue: undefined,
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', v: ModelValue): void
    (e: 'change', v: ModelValue): void
  }>()

  const isFocused = ref(false)

  function isChoice(v: unknown): v is MoreTableChoice {
    return (
      !!v &&
      typeof v === 'object' &&
      'value' in v &&
      'label' in v
    )
  }

  const isChecked = computed(() => {
    const tempModelValue = props.modelValue
    const tempValue = props.value

    // Objektvergleich über .value (nicht Referenz)
    if (isChoice(tempModelValue) && isChoice(tempValue)) {
      return tempModelValue.value === tempValue.value
    }

    // Primitive normal
    return tempModelValue === tempValue
  })

  // HTML <input value> darf kein Objekt sein -> primitive Repräsentation
  const inputValue = computed(() => {
    const v = props.value
    if (isChoice(v)) return v.value ?? ''
    return v
  })

  function onChange(): void {
    if (props.disabled) return
    emit('update:modelValue', props.value)
    emit('change', props.value)
  }
</script>

<template>
  <label
    class="rl-radio mb-1.5 mr-1.5"
    :class="{
      'is-disabled': disabled,
      'is-checked': isChecked,
      'is-invalid': invalid,
    }"
  >
    <span class="rl-radio-input">
      <input
        class="rl-radio-native"
        type="radio"
        :name="name"
        :value="inputValue"
        :checked="isChecked"
        :disabled="disabled"
        :aria-invalid="invalid ? 'true' : undefined"
        @change="onChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <span class="rl-radio-box" :class="{ 'is-focused': isFocused }">
        <span v-if="isChecked" class="rl-radio-dot" />
      </span>
    </span>

    <span v-if="$slots.default" class="rl-radio-label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
  .rl-radio {
    --rl-size: 14px;
    --rl-border: var(--surface-400);
    --rl-bg: #ffffff;
    --rl-fg: var(--gray-500);
    --rl-accent: var(--primary-color);
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

  .rl-radio.is-disabled {
    cursor: not-allowed;
    opacity: var(--rl-disabled-opacity);
  }

  .rl-radio-input {
    position: relative;
    display: inline-flex;
    width: var(--rl-size);
    height: var(--rl-size);
    flex: 0 0 var(--rl-size);
  }

  .rl-radio-native {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  .rl-radio-box {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    border: 1px solid var(--rl-border);
    border-radius: 9999px;
    background: var(--rl-bg);
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }

  .rl-radio-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--rl-accent);
  }

  /* Focus ring */
  .rl-radio-box.is-focused {
    box-shadow: 0 0 0 4px var(--rl-focus);
  }

  /* Checked */
  .rl-radio.is-checked .rl-radio-box {
    border-color: var(--rl-accent);
  }

  /* Invalid */
  .rl-radio.is-invalid .rl-radio-box {
    border-color: var(--rl-invalid);
  }
  .rl-radio.is-invalid.is-checked .rl-radio-dot {
    background: var(--rl-invalid);
  }
</style>

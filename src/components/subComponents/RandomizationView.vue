<template>
  <div class="flex !w-full flex-col gap-2">
    <hr class="" />
    <h6>{{ $t('scheduler.randomization.title') }}</h6>
    <p>{{ $t('scheduler.randomization.description') }}</p>
    <p>
      {{
        $t('scheduler.randomization.maxDuration', {
          maxDuration: props.maxDurationInMinutes,
        })
      }}
    </p>
    <div class="flex items-center justify-start gap-2">
      <InputNumber
        :model-value="props.duration"
        :placeholder="$t('scheduler.randomization.duration')"
        :min="0"
        @update:model-value="onChange"
      />
      <span>{{ $t('scheduler.randomization.duration') }}</span>
    </div>
    <p v-if="warning" class="text-red-600">
      {{ $t('scheduler.randomization.warning') }}
    </p>
  </div>
</template>
<script setup lang="ts">
  import InputNumber from 'primevue/inputnumber';
  import { ref } from 'vue';

  const warning = ref(false);

  const props = defineProps<{
    duration: number;
    maxDurationInMinutes: number;
  }>();
  const emits = defineEmits<{
    (e: 'update:duration', value: number): void;
  }>();

  function onChange(value?: number): void {
    if (typeof value === 'number') {
      if (value > props.maxDurationInMinutes) {
        warning.value = true;
      }
    }
    emits('update:duration', value);
  }
</script>

<style scoped lang="postcss"></style>

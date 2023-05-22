<script setup lang="ts">
  import Message from 'primevue/message';
  import { onUpdated, ref, Ref } from 'vue';

  const props = defineProps({
    styleModifier: {
      type: String,
      default: '',
    },
    severityType: {
      type: undefined,
      default: 'success',
    },
    message: {
      type: String,
      required: true,
    },
    showMsg: {
      type: Boolean,
      required: true,
    },
  });

  onUpdated(() => {
    if (props.showMsg) {
      showMessage();
    }
  });

  const emit = defineEmits<{
    (e: 'onMsgChange'): boolean;
  }>();

  const inlineStyle: Ref<string> = ref('opacity: 0');

  function showMessage() {
    setTimeout(() => {
      inlineStyle.value = 'opacity: 0%';
      emit('onMsgChange');
    }, 3000);
  }
</script>

<template>
  <Message
    :severity="severityType"
    class="message"
    :style="showMsg ? 'opacity: 100%' : 'opacity: 0%'"
    >{{ message }}</Message
  >
</template>

<style scoped lang="postcss">
  .message {
    position: fixed;
    top: 200%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity ease-in-out 0.5s;
  }
</style>

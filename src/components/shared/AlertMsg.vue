/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Apache 2.0 license (see https://www.apache.org/licenses/LICENSE-2.0). */
<script setup lang="ts">
  import Message from 'primevue/message';
  import { onUpdated } from 'vue';

  const props = defineProps({
    styleModifier: {
      type: String,
      default: '',
    },
    // msg or alert
    type: {
      type: String,
      default: 'msg',
    },
    // success or error
    severityType: {
      type: String,
      default: '',
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

  function showMessage(): void {
    setTimeout(() => {
      emit('onMsgChange');
    }, 3000);
  }
</script>

<template>
  <Message
    :severity="
      type === 'msg'
        ? severityType === 'success'
          ? 'success'
          : 'info'
        : severityType === 'error'
          ? 'error'
          : 'warn'
    "
    class="message"
    :class="styleModifier"
    :style="showMsg ? 'opacity: 100%' : 'opacity: 0%'"
    >{{ message }}</Message
  >
</template>

<style scoped>
  .message {
    position: fixed;
    top: 60px;
    right: 10px;
    transition: opacity ease-in 0.02s;
    z-index: 1000;
    padding: 10px;
  }
</style>

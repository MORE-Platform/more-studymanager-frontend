<script setup lang="ts">
import {PropType} from 'vue';
import Button from 'primevue/button'
import {StudyStatus} from '../../generated-sources/openapi';
defineProps({
  status: {
    type: String,
    required: true
  }
});
const emit = defineEmits<{(e: 'onchange', status: StudyStatus): void}>()
</script>
<template>
  <div class="buttons" v-if="status === StudyStatus.Draft">
    <Button type="button" icon="pi pi-play" title="Start" @click="emit('onchange', StudyStatus.Active)"></Button>
  </div>
  <div class="buttons" v-if="status === StudyStatus.Active">
    <Button type="button" icon="pi pi-pause" title="Pause" @click="emit('onchange', StudyStatus.Paused)"></Button>
    <Button type="button" icon="pi pi-stop-circle" title="Close" @click="emit('onchange', StudyStatus.Closed)"></Button>
  </div>
  <div class="buttons" v-if="status === StudyStatus.Paused">
    <Button type="button" icon="pi pi-play" title="Resume" @click="emit('onchange', StudyStatus.Active)"></Button>
    <Button type="button" icon="pi pi-stop-circle" title="Close" @click="emit('onchange', StudyStatus.Closed)"></Button>
  </div>
</template>

<style lang="postcss">
  .buttons {
    display:flex;
    margin-right: 5px;
  }
</style>

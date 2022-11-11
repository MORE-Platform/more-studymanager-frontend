<template>
  Some Value
  <Button @click="save()">Save</Button>
  <Button @click="cancel()">Cancel</Button>
</template>

<script setup lang="ts">
import {inject} from 'vue';
import Button from 'primevue/button'

const dialogRef:any = inject("dialogRef");

function save() {
  dialogRef.value.close();
}

function cancel() {
  dialogRef.value.close();
}

</script>

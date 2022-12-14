<script setup lang="ts">
  import {inject} from "vue";
  import Button from "primevue/button";

  const dialogRef:any = inject("dialogRef")
  const message:number = dialogRef?.value?.data?.message;

  function closeDialog() {
    dialogRef.value.close();
  }

  console.log("hello from info dialog")
</script>

<template>
  <div class="info-dialog">
    <div class="mb-8">{{ message }}</div>
    <div class="flex justify-end"><Button type="button" class="p-button" @click="closeDialog">Close</Button></div>
  </div>
</template>

<style>

  .info-dialog {
    font-size: 1rem;
  }

</style>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { watch, computed, ref } from 'vue';
  import { useStudyStore } from '../../stores/studyStore';
  import Button from 'primevue/button';
  import ProgressSpinner from 'primevue/progressspinner';

  const { t } = useI18n();
  const studyStore = useStudyStore();
  const isLoading = ref<boolean>(false);

  const props = defineProps({
    studyId: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      required: true
    }
  })

  const auditLogMetadataLength = computed(() => studyStore.auditLogMetadata?.length)

  watch(() => props.isActive,
    (active) => {
    if(active) {
      getAuditlogMetadata()
    }
    }, {immediate: true})

  async function getAuditlogMetadata(): Promise<void> {

     await studyStore.getAuditLogMetadata(studyStore.studyId)

  }

  function downloadCurrentAuditlog(): void {
    isLoading.value = true
    studyStore.exportAuditLog(studyStore.studyId)
      .finally(() => isLoading.value = false);
  }
</script>

<template>
  <div>
    <h3 class="mb-1 font-bold">{{t('data.auditLogDownload.title')}}</h3>
    <div v-if="!auditLogMetadataLength">{{t('data.auditLogDownload.notStartedInfo')}}</div>
    <div v-else-if="auditLogMetadataLength">
      {{t('data.auditLogDownload.description', { length: auditLogMetadataLength || 0 } )}}
    </div>
    <div v-else>{{t('data.auditLogDownload.noDataInfo')}}</div>
  </div>

  <div v-if="auditLogMetadataLength" class="flex justify-end">
    <Button
      icon="pi pi-download"
      class="mt-8"
      :label="$t('data.auditLogDownload.btnLabel')"
      :disabled="isLoading"
      @click="downloadCurrentAuditlog()"
    >
      <span class="p-button-icon p-button-icon-left pi pi-download"></span>
      <span>{{t('data.auditLogDownload.btnLabel')}}</span>
      <ProgressSpinner
        v-if="isLoading"
        class="!text-white ml-2"
        style="width: 25px; height: 25px"
        stroke-width="6"
        fill="transparent"
        animation-duration=".5s"
      />
    </Button>
  </div>
</template>

<style scoped>
  :deep(.p-progress-spinner-circle) {
    stroke: currentColor;
  }
</style>

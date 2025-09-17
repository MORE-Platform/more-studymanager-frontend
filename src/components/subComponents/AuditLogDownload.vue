<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { watch, computed } from 'vue';
  import { useStudyStore } from '../../stores/studyStore';
  import Button from 'primevue/button';

  const { t } = useI18n();
  const studyStore = useStudyStore();

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
     await studyStore.getAuditLogMetadata(studyStore.studyId);
  }

  function downloadCurrentAuditlog(): void {
    studyStore.exportAuditLog(studyStore.studyId)
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
      @click="downloadCurrentAuditlog()"
    />
  </div>
</template>

<style scoped lang="scss">

</style>

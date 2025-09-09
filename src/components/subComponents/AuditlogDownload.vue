<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import { ref, watch, computed } from 'vue';
  import { useStudyStore } from '../../stores/studyStore';
  import Button from 'primevue/button';
  import { StudyStatus } from '@gs';

  const { t } = useI18n();
  const studyStore = useStudyStore();

  const auditlogMetadata = ref();

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

  const studyStatus = computed(() => studyStore.studyStatus)

  watch(() => props.isActive,
    (active) => {
    if(active) {
      getAuditlogMetadata()
    }
    }, {immediate: true})

  async function getAuditlogMetadata(): Promise<void> {
    auditlogMetadata.value = await studyStore.getAuditlogMetadata(studyStore.studyId) || undefined
  }

  function downloadCurrentAuditlog(): void {
    studyStore.exportCurrentAuditlog(studyStore.studyId)
  }
</script>

<template>
  <div>
    <h3 class="mb-1 font-bold">{{t('data.auditlogDownload.title')}}</h3>
    <div v-if="studyStatus !== StudyStatus.Active">{{t('data.auditlogDownload.notStartedInfo')}}</div>
    <div v-else-if="auditlogMetadata && auditlogMetadata.value.length">{{t('data.auditlogDownload.description')}}</div>
    <div v-else>{{t('data.auditlogDownload.noDataInfo')}}</div>
  </div>

  <div v-if="auditlogMetadata && auditlogMetadata.value.length" class="flex justify-end">
    <Button
      icon="pi pi-download"
      class="mt-8"
      :label="$t('data.auditlogDownload.btnLabel')"
      @click="downloadCurrentAuditlog()"
    />
  </div>
</template>

<style scoped lang="scss">

</style>

<script setup lang="ts">
  import { inject } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { EventDetail, EventOptions } from '../../models/Timeline';
  const { t, d } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const eventDetail: EventDetail = dialogRef.value.data.eventDetail;
  const startDate = `${t('global.labels.start')}: ${d(new Date(eventDetail.start), 'long')}`;
  const endDate = `${t('global.labels.end')}: ${d(new Date(eventDetail.end), 'long')}`;
</script>

<template>
  <div class="dialog">
    <p>{{ startDate }}</p>
    <p v-if="eventDetail.options.includes(EventOptions.showEndDateInDialog)">
      {{ endDate }}
    </p>
    <p>{{ eventDetail.scheduleType }}</p>
    <p>{{ eventDetail.typeTranslation }}</p>
    <p v-if="eventDetail.purpose">
      {{ `${t('study.props.purpose')}: ${eventDetail.purpose}` }}
    </p>
    <p v-if="eventDetail.options.includes(EventOptions.showEyeIcon)">
      {{
        eventDetail.isHidden
          ? t('observation.props.hidden.true')
          : t('observation.props.hidden.false')
      }}
    </p>
  </div>
</template>

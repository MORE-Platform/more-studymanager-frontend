<script setup lang="ts">
  import { inject } from 'vue';
  import { useI18n } from 'vue-i18n';
  import dayjs from 'dayjs';
  import { Event } from 'vue-cal';
  const { t } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const event: Event = dialogRef.value.data.event;
  const startDate = `${t('global.labels.start')}: ${dayjs(event.start).format(
    'DD/MM/YYYY',
  )}, ${dayjs(event.start).format('HH:mm')}`;
  const endDate = `${t('global.labels.end')}: ${dayjs(event.end).format(
    'DD/MM/YYYY',
  )}, ${dayjs(event.end).format('HH:mm')}`;
  const scheduleType = event.cScheduleType;
  const typeTranslation = event.cTypeTranslation;
  const purpose = event.cPurpose;
  const hidden = event.cHidden;
</script>

<template>
  <div class="dialog">
    <p>{{ startDate }}</p>
    <p v-if="event.class === 'observation'">{{ endDate }}</p>
    <p>{{ scheduleType }}</p>
    <p>{{ typeTranslation }}</p>
    <p v-if="purpose">{{ `${t('study.props.purpose')}: ${purpose}` }}</p>
    <p v-if="event.class === 'observation'">
      {{
        hidden
          ? t('observation.props.hidden.true')
          : t('observation.props.hidden.false')
      }}
    </p>
  </div>
</template>

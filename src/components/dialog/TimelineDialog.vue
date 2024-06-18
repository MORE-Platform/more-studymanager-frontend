<script setup lang="ts">
  import { inject } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Event } from 'vue-cal';
  const { t, d } = useI18n();

  const dialogRef: any = inject('dialogRef');
  const event: Event = dialogRef.value.data.event;
  const startDate = `${t('global.labels.start')}: ${d(new Date(event.start), 'long')}`;
  const endDate = `${t('global.labels.end')}: ${d(new Date(event.end), 'long')}`;
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

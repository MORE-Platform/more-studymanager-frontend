/* Copyright LBI-DHP and/or licensed to LBI-DHP under one or more contributor
license agreements (LBI-DHP: Ludwig Boltzmann Institute for Digital Health and
Prevention -- A research institute of the Ludwig Boltzmann Gesellschaft,
Oesterreichische Vereinigung zur Foerderung der wissenschaftlichen Forschung).
Licensed under the Elastic License 2.0. */
<script setup lang="ts">
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Accordion from 'primevue/accordion';
  import AccordionTab from 'primevue/accordiontab';
  import { useI18n } from 'vue-i18n';
  const { t } = useI18n();

  const tableColumns = [
    {
      field: 'title',
      header: 'Title',
    },
    {
      field: 'minutes',
      header: t('cronSchedule.labels.minutes'),
    },
    {
      field: 'hours',
      header: t('cronSchedule.labels.hours'),
    },
    {
      field: 'dayOfMonth',
      header: t('cronSchedule.labels.dayOfMonth'),
    },
    {
      field: 'months',
      header: t('cronSchedule.labels.months'),
    },
    {
      field: 'dayOfWeek',
      header: t('cronSchedule.labels.dayOfWeek'),
    },
  ];

  const tableRows = [
    {
      title: t('cronSchedule.example.titles.everyMinute'),
      minutes: '*',
      hours: '*',
      dayOfMonth: '?',
      months: '*',
      dayOfWeek: '*',
    },
    {
      title: t('cronSchedule.example.titles.hourly'),
      minutes: '30',
      hours: '*',
      dayOfMonth: '?',
      months: '*',
      dayOfWeek: '*',
    },
    {
      title: t('cronSchedule.example.titles.daily'),
      minutes: '0',
      hours: '12',
      dayOfMonth: '?',
      months: '*',
      dayOfWeek: '*',
    },
    {
      title: t('cronSchedule.example.titles.specificDayOfMonth'),
      minutes: '*',
      hours: '*',
      dayOfMonth: '4',
      months: '*',
      dayOfWeek: '*',
    },
    {
      title: t('cronSchedule.example.titles.specificMonth'),
      minutes: '0',
      hours: '8',
      dayOfMonth: '*',
      months: '3',
      dayOfWeek: '?',
    },
    {
      title: t('cronSchedule.example.titles.everyFiveMinutes'),
      minutes: '0/5',
      hours: '*',
      dayOfMonth: '?',
      months: '*',
      dayOfWeek: '*',
    },
    {
      title: t('cronSchedule.example.titles.everyMinuteInSetTime'),
      minutes: '0-10',
      hours: '*',
      dayOfMonth: '?',
      months: '*',
      dayOfWeek: '*',
    },
    {
      title: t('cronSchedule.example.titles.specificHourRange'),
      minutes: '30',
      hours: '8-10',
      dayOfMonth: '?',
      months: '*',
      dayOfWeek: '*',
    },
  ];
</script>

<template>
  <div class="cron-schedule-examples">
    <Accordion>
      <AccordionTab :header="$t('cronSchedule.example.title')">
        <div class="examples">
          <DataTable :value="tableRows">
            <Column
              v-for="col in tableColumns"
              :key="col.field"
              :field="col.field"
              :header="col.header"
            />
          </DataTable>
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<style scoped lang="postcss">
  .cron-schedule-examples .examples {
    border: 1px solid var(--surface-50);
    border-radius: 6px;
    background-color: var(--surface-50);
  }

  :deep(.p-accordion) {
    .p-accordion-header-link {
      border: 1px solid var(--surface-100);
      background: var(--surface-50);
      transition: ease-in-out 0.35s;

      &:hover {
        background: var(--surface-100);
      }
    }
    .p-accordion-content {
      background: var(--surface-50);
      border: 1px solid var(--surface-50);
      padding: 1rem 1.5rem 1.5rem;
    }
  }

  :deep(.p-datatable-wrapper tr) {
    th {
      padding-top: 0;
      padding-bottom: 7px;

      .p-column-title {
        width: 100%;
      }
    }
    td,
    th {
      text-align: center;

      &:first-of-type {
        font-weight: 500;
        text-align: left;
      }
    }

    td:first-of-type {
      color: var(--primary-color);
    }
  }
</style>

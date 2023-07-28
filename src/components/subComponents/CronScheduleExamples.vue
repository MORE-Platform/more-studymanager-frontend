<script setup lang="ts">
</script>

<template>
  <div class="cron-schedule-examples">
    <h6 class="mb-1 font-medium">{{ $t('cronSchedule.example.title') }}</h6>
    <div class="examples grid grid-cols-3 gap-6 lg:grid-cols-5">
      <div>
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.everyMinute') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.everyMinute') }}
        </div>
      </div>
      <div>
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.hourly') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.hourly') }}
        </div>
      </div>
      <div>
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.daily') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.daily') }}
        </div>
      </div>
      <div>
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.specificDayOfMonth') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.specificDayOfMonth') }}
        </div>
      </div>
      <div>
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.specificMonth') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.specificMonth') }}
        </div>
      </div>
      <div>
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.everyFiveMinutes') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.everyFiveMinutes') }}
        </div>
      </div>
      <div>
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.specificHourRange') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.specificHourRange') }}
        </div>
      </div>
      <div class="col-span-2">
        <div class="color-primary">
          {{ $t('cronSchedule.example.titles.everyMinuteInSetTime') }}
        </div>
        <div class="font-medium">
          {{ $t('cronSchedule.example.values.everyMinuteInSetTime') }}
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="postcss">
  .cron-schedule-examples .examples {
    border: 1px solid var(--surface-50);
    padding: 1rem 0.5rem;
    border-radius: 6px;
    background-color: var(--surface-50);
  }
</style>

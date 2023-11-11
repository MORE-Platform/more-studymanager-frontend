/*
 * Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 * contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 * for Digital Health and Prevention -- A research institute of the
 * Ludwig Boltzmann Gesellschaft, Österreichische Vereinigung zur
 * Förderung der wissenschaftlichen Forschung).
 * Licensed under the Elastic License 2.0.
 */
export interface TriggerSchedule {
  seconds: string;
  minutes: string;
  hours: string;
  dayOfMonth: string;
  months: string;
  dayOfWeek: string;
}

export interface CronScheduleChoice {
  label: string;
  value: string;
  placeholder: string;
}

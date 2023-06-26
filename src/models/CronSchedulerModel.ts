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

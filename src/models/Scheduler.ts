/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { Frequency, Weekday } from '../generated-sources/openapi';

export default interface Scheduler {
  //start time
  dtstart: string;
  // end time
  dtend: string;
  // repeatition rules
  rrule?: RRule;
}

export interface RRule {
  freq?: Frequency;
  interval?: number;
  // don't use count when until is filled
  count?: number;
  // don't use until when count is filled
  until?: Date;
  // repeat by day
  byday?: Weekday[];
  // repeat by month
  bymonth?: number;
  // repeat by month day
  bymonthday?: number;
  // repeat by set position
  bysetpos?: number;
}

export const ScheduleType = {
  RelativeEvent: 'RelativeEvent',
  Event: 'Event',
} as const;

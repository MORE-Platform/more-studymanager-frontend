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

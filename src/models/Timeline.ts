/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { Event } from 'vue-cal';
import { DropdownOption } from './Common';

export interface GroupOption {
  label: string;
  items: Array<DropdownOption>;
}

export interface EventDetail extends Event {
  isHidden?: boolean;
  scheduleType?: string;
  typeTranslation?: string;
  type?: string;
  purpose?: string;
  options: Array<number>;
}

export enum EventOptions {
  showEyeIcon,
  ignoreFilter, // always show in the calendar
  showDialogInformation, // clickable to open a dialog popup
  showEndDateInDialog,
  showStartTime, // show HH:mm in the calendar event
  showEndTime, // show HH:mm in the calendar event
}

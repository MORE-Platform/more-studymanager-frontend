/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
import { QueryObjectInner } from './InputModels';

export interface InterventionTriggerConfig {
  observationId: number | undefined;
  observationType: string;
  observationProperty: string;
  operator: string;
  propertyValue: string | number;
  editMode?: boolean;
  error?: boolean;
}

export interface InterventionTriggerUpdateItem {
  edit?: boolean;
  groupIndex: number;
  rowIndex: number;
  data?: InterventionTriggerConfig;
}
export interface InterventionTriggerUpdateData {
  data: QueryObjectInner;
  groupIndex: number;
  rowIndex: number;
}

export interface GroupConditionChange {
  groupIndex: number;
  value: string;
}

export interface InterventionChoice {
  label: string;
  value: string | number;
}

export interface PushNotificationObject {
  title: string;
  message: string;
}

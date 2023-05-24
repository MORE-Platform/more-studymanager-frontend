export interface InterventionTriggerConfig {
  observationId: number | undefined;
  observationTitle: string;
  observationType: string;
  observationProperty: string;
  operator: string;
  propertyValue: string;
  editMode: boolean;
}

export interface InterventionTriggerUpdateItem {
  edit?: boolean;
  groupIndex: number;
  rowIndex: number;
}
export interface InterventionTriggerUpdateData {
  data: InterventionTriggerConfig;
  groupIndex: number;
  rowIndex: number;
}

export interface TriggerObservationType {
  type: string;
  properties: Array<string>;
}

export interface TriggerConditionGroup {
  nextGroupCondition: string | null;
  parameter: Array<InterventionTriggerConfig>;
}

export interface GroupConditionChange {
  groupIndex: number;
  value: string;
}

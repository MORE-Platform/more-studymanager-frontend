/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */

import { Intervention, Observation, Participant, Study, StudyGroup } from '@gs';

export interface MoreTableColumn {
  field: string;
  header: string;
  type?: MoreTableFieldType;
  editable?: boolean | MoreTableEditable;
  sortable?: boolean;
  filterable?: boolean;
  placeholder?: string;
  arrayLabels?: MoreTableChoice[];
  columnWidth?: string;
}

export interface MoreTableEditable {
  enabled: boolean;
  values: MoreTableChoice[];
}

export interface MoreTableChoice {
  label: string;
  value: string | null;
}

export interface MoreTableSortOptions {
  sortField: string;
  sortOrder: -1 | 0 | 1;
}

export interface MoreTableAction {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  confirmDeleteDialog?: MoreTableActionConfirmDialog;
  visible?: (data?: any) => boolean;
}

export interface MoreTableRowActionResult {
  id: string;
  row: ActionResult;
}

type ActionResult =
  | Participant
  | MoreIntegrationTableMap
  | StudyGroup
  | Study
  | Intervention
  | Observation
  | MoreTableCollaboratorItem
  | MoreStudyGroupTableMap;

export interface MoreTableActionConfirmDialog {
  header: string;
  message: string;
  dialog: (row: any) => any;
}

export enum MoreTableFieldType {
  string,
  number,
  choice,
  calendar,
  multiselect,
  singleselect,
  longtext,
  datetime,
  statusString,
  showIcon,
  nested,
  nestedDatetime,
  binaryIcon,
}

export interface MoreTableCollaboratorItem {
  uid: string;
  name: string;
  institution: string;
  email?: string;
  roles: Array<MoreTableChoice>;
}

export interface MoreTableCollaboratorItemOption {
  label: string; // name
  value: string; // uid
  institution: string;
}

export interface MoreIntegrationTableMap {
  observationId: number;
  observationTitle: string;
  tokenId: number;
  tokenLabel: string;
  created: string;
}

export interface MoreIntegrationLink {
  observationId: number;
  tokenLabel: string;
}

export interface MoreStudyGroupTableMap {
  studyId?: number;
  studyGroupId?: number;
  title?: string;
  purpose?: string;
  durationValue?: number;
  durationUnit?: string;
  numberOfParticipants?: number;
  created?: string;
  modified?: string;
}

export enum RowSelectionMode {
  Single = 'single',
  Multiple = 'multiple',
}

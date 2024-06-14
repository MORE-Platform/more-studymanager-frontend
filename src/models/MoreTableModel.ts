/*
 Copyright LBI-DHP and/or licensed to LBI-DHP under one or more
 contributor license agreements (LBI-DHP: Ludwig Boltzmann Institute
 for Digital Health and Prevention -- A research institute of the
 Ludwig Boltzmann Gesellschaft, Oesterreichische Vereinigung zur
 Foerderung der wissenschaftlichen Forschung).
 Licensed under the Elastic License 2.0.
 */
export interface MoreTableColumn {
  field: string;
  header: string;
  type?: MoreTableFieldType; //default is string
  editable?:
    | MoreTableChoiceOptions
    | MoreTableEditableChoiceProperties
    | boolean
    | ((data?: any) => boolean);
  sortable?: boolean;
  filterable?: boolean | MoreTableFilterOption;
  placeholder?: string;
  arrayLabels?: MoreTableChoice[];
  columnWidth?: string;
}

export interface MoreTableFilterOption {
  value?: unknown;
  showFilterMatchModes?: boolean;
  matchMode?: string;
}

// actions
export interface MoreTableChoiceOptions {
  values: MoreTableChoice[];
  placeholder?: string;
  showValuesForEditing?: boolean;
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
  options?: MoreTableActionOptions;
  confirm?: MoreTableActionConfirm;
  confirmDeleteDialog?: MoreTableActionConfirmDialog;
  visible?: (data?: any) => boolean;
  tooltip?: string;
}

export interface MoreTableRowActionResult<D> {
  id: string;
  row: D;
}

export interface MoreTableActionResult {
  id: string;
  properties?: any;
}

export interface MoreTableActionOptions {
  type: 'menu' | 'split' | 'search' | 'fileUpload';
  values: MoreTableActionOption[];
  valuesCallback?: MoreTableActionOptionCallback;
  uploadOptions?: MoreTableActionFileUpload;
}

export interface MoreTableActionFileUpload {
  mode?: FileUploadModeType;
  multiple?: boolean;
  acceptType?: string;
  maxFileSize?: number;
}

export interface MoreTableActionOption {
  label: string;
  value?: any;
  icon?: string;
}

export interface MoreTableActionOptionCallback {
  callback: (query: string) => Promise<Array<MoreTableActionOption[]>>;
  placeholder?: string;
  filterPlaceholder?: string;
  noResultsPlaceholder?: string;
}

export interface MoreTableActionConfirm {
  header: string;
  message: string;
}
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

export enum FileUploadModeType {
  advanced = 'advanced',
  basic = 'basic',
}

export interface MoreTableEditableProperties {}

export interface MoreTableEditableChoiceProperties
  extends MoreTableEditableProperties {
  values: MoreTableEditableChoicePropertyValues[];
}

export interface MoreTableEditableChoicePropertyValues {
  label?: string;
  value: string;
}

export interface MoreTableCollaboratorItem {
  uid: string;
  name: string;
  institution: string;
  email?: string;
  roles: Array<MoreTableChoice>;
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

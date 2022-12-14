export interface MoreTableColumn {
  field: string
  header: string
  type?: MoreTableFieldType //default is string
  editable?: MoreTableEditableChoiceProperties | boolean | ((data?:any) => boolean),
  sortable?: boolean
  filterable?: boolean | MoreTableFilterOption,
  placeholder?: string
}

// filter
export interface MoreTableFilters {
  [key: string]: MoreTableFilterOption
}

export interface MoreTableFilterOption {
  value?: unknown
  showFilterMatchModes?: boolean,
  matchMode?: string
}

// actions
export interface MoreTableChoiceOptions {
  values: MoreTableChoice[],
  placeholder?: string
}
export interface MoreTableChoice {
  label: string,
  value: string|null
}

export interface MoreTableSortOptions {
  sortField: string,
  sortOrder: -1 | 0 | 1
}

export interface MoreTableAction {
  id: string,
  label: string,
  icon?: string,
  options?: MoreTableActionOptions
  confirm?: MoreTableActionConfirm,
  visible?: (data?:any) => boolean,
}

export interface MoreTableRowActionResult<D> {
  id: string,
  row: D
}

export interface MoreTableActionResult {
  id: string
  properties?: any
}

export interface MoreTableActionOptions {
  type: 'menu'|'split'|'search'
  values: MoreTableActionOption[]
  valuesCallback?: MoreTableActionOptionCallback
  query?: string
}

export interface MoreTableActionOption {
  label: string,
  value?: any,
  icon?: string
}

export interface MoreTableActionOptionCallback {
  callback: (query: string) => Promise<Array<MoreTableActionOption[]>>,
  placeholder?: string
}


export interface MoreTableActionConfirm {
  header: string,
  message: string
}

export enum MoreTableFieldType {
  string,
  choice,
  calendar,
  multiselect = 3,
  longtext = 4
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MoreTableEditableProperties {

}

export interface MoreTableEditableChoiceProperties extends MoreTableEditableProperties{
  values: MoreTableEditableChoicePropertyValues[]
}

export interface MoreTableEditableChoicePropertyValues {
  label?:string
  value: string
}

export enum MoreTableRoleTypes {
  STUDY_ADMIN = "Study Administrator",
  STUDY_OPERATOR = "Study Operator",
  STUDY_VIEWER = "Study Viewer"
}

export interface MoreTableCollaboratorItem {
  uid: string,
  name: string,
  institution: string,
  email?: string,
  roles: Array<MoreTableChoice>
}

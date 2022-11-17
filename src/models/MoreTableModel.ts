export interface MoreTableColumn {
  field: string
  type?: MoreTableFieldType //default is string
  header: string
  editable?: MoreTableEditableProperties | boolean
  sortable?: boolean
  filterable?: boolean | MoreTableFilterOption,
  choiceOptions?: MoreTableChoiceOptions ,
  placeholder?: string
}

export interface MoreTableChoiceOptions {
  statuses: Array<MoreTableChoice>,
  placeholder?: string
}
export interface MoreTableChoice {
  label: string,
  value: string
}

export interface MoreTableFilters {
  [key: string]: MoreTableFilterOption
}

export interface MoreTableFilterOption {
  value?: unknown
  showFilterMatchModes?: boolean,
  matchMode?: string
}

export interface MoreTableSortOptions {
  sortField: string,
  sortOrder: -1 | 0 | 1
}

export interface MoreTableAction {
  id: string,
  label: string,
  icon?: string,
  options?: MoreTableActionOptions[]
  confirm?: MoreTableActionConfirm,
  visible?: (data:any) => boolean
}

export interface MoreRowActionVisible {
  draft?: boolean,
  active?: boolean,
  paused?: boolean,
  closed?: boolean
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
  label: string,
  value?: any,
  icon?: string
}

export interface MoreTableActionConfirm {
  header: string,
  message: string
}

export enum MoreTableFieldType {
  string,
  choice,
  calendar,
  multiselect = 3
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MoreTableEditableProperties {
  visible: MoreRowActionVisible
}

export interface MoreTableEditableChoiceProperties extends MoreTableEditableProperties{
  emptyText?: string,
  values: MoreTableEditableChoicePropertyValues[]
}

export interface MoreTableEditableChoicePropertyValues {
  displayValue?:string
  value: string
}

export interface MoreTableShowBtn {
  row: any,
  btn: MoreTableActionBtnTypes
}

export enum MoreTableActionBtnTypes {
  edit = 0,
  delete = 1,
  downloadSettings = 2,
  downloadData = 3,
  showData = 4
}

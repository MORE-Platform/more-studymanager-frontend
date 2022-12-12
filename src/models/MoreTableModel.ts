export interface MoreTableColumn {
  field: string
  header: string
  type?: MoreTableFieldType //default is string
  editable?: MoreTableEditableChoiceProperties | boolean
  sortable?: boolean
  filterable?: boolean | MoreTableFilterOption
  placeholder?: string
}

export interface MoreTableFilterOption {
  value?: unknown
  showFilterMatchModes?: boolean
  matchMode?: string
}

export interface MoreTableChoice {
  label: string
  value: string | null
}

export interface MoreTableSortOptions {
  sortField: string
  sortOrder: -1 | 0 | 1
}

export interface MoreTableAction {
  id: string
  label: string
  icon?: string
  options?: MoreTableActionOptions
  confirm?: MoreTableActionConfirm
  visible?: (data?: any) => boolean
}

export interface MoreTableRowActionResult<D> {
  id: string
  row: D
}

export interface MoreTableActionResult {
  id: string
  properties?: any
}

export interface MoreTableActionOptions {
  type: 'menu' | 'split'
  values: MoreTableActionOption[]
}

export interface MoreTableActionOption {
  label: string
  value?: any
  icon?: string
}

export interface MoreTableActionConfirm {
  header: string
  message: string
}

export enum MoreTableFieldType {
  string,
  choice,
  calendar,
  multiselect = 3,
  longtext = 4,
}

export interface MoreTableEditableChoiceProperties {
  values: MoreTableEditableChoicePropertyValues[]
}

export interface MoreTableEditableChoicePropertyValues {
  label?: string
  value: string
}

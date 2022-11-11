export interface MoreTableColumn {
  field: string
  type?: MoreTableFieldType //default is string
  header: string
  editable?: MoreTableEditableProperties | boolean
  sortable?: boolean
  filterable?: boolean | MoreTableFilterOption,
  choiceOptions?: MoreTableChoiceOptions
}

export interface MoreTableChoiceOptions {
  statuses: Array<MoreTableChoice>,
  placeholder: string
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
  confirm?: MoreTableActionConfirm
}

export interface MoreTableRowActionResult<D> {
  id: string,
  row: D
}

export interface MoreTableActionResult {
  id: string
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
}

export interface MoreTableEditableChoiceProperties extends MoreTableEditableProperties{
  emptyText?: string,
  values: MoreTableEditableChoicePropertyValues[]
}

export interface MoreTableEditableChoicePropertyValues {
  displayValue?:string
  value: string
}

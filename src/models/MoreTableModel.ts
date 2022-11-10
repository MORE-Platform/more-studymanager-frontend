export interface MoreTableColumn {
  field: string
  type?: MoreTableFieldType //default is string
  header: string
  editable?: MoreTableEditableProperties | boolean
  sortable?: boolean
}

export interface MoreTableSortOptions {
  sortField: string,
  sortOrder: -1 | 0 | 1
}

export interface MoreTableAction {
  id: string,
  label: string,
  icon: string,
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
  calendar
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

export interface MoreTableColumn {
  field: string
  header: string
  editable?: MoreTableEditable
}

export interface MoreTableAction {
  id: string,
  label: string,
  icon: string,
  confirm?: MoreTableActionConfirm
}

export interface MoreTableRowEditResult {
  rowId: string,
  data: unknown
}

export interface MoreTableActionResult {
  id: string,
  data: unknown
}

export interface MoreTableActionConfirm {
  header: string,
  message: string
}

export enum MoreTableEditableType {
  string,
  choice,
  calendar
}

export interface MoreTableEditable {
  type: MoreTableEditableType,
  properties?: MoreTableEditableChoiceProperties
}

export interface MoreTableEditableStringProperties {
  longText: boolean
}

export interface MoreTableEditableChoiceProperties {
  emptyText?: string,
  values: MoreTableEditableChoicePropertyValues[]
}

export interface MoreTableEditableChoicePropertyValues {
  value: unknown
}

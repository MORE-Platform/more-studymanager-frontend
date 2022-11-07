export interface MoreTableColumn {
  field: string
  header: string
}

export interface MoreTableAction {
  id: string,
  label: string,
  icon: string,
  confirm?: MoreTableActionConfirm
}

export interface MoreTableActionResult {
  id: string,
  data: unknown
}

export interface MoreTableActionConfirm {
  header: string,
  message: string
}

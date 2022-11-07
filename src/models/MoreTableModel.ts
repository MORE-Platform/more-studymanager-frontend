export interface MoreTableColumn {
  field: string
  header: string
}

export interface MoreTableAction {
  id: string,
  label: string,
  icon: string
}

export interface MoreTableActionResult {
  id: string,
  data: unknown
}

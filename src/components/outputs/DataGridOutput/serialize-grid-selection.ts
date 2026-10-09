import { type GridSelection } from "@glideapps/glide-data-grid"

import { type DataGridState } from "./DataGridState.ts"

export function serializeGridSelection(selection: GridSelection): DataGridState["selection"] {
  return {
    current: selection.current,
    columns: selection.columns.toArray(),
    rows: selection.rows.toArray()
  }
}

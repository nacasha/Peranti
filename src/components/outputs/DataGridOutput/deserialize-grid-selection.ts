import { CompactSelection, type GridSelection } from "@glideapps/glide-data-grid"

import { type DataGridState } from "./DataGridState.ts"

const toCompactSelection = (indexes: number[] = []) =>
  indexes.reduce((selection, index) => selection.add(index), CompactSelection.empty())

export function deserializeGridSelection(selection: DataGridState["selection"]): GridSelection {
  return {
    current: selection?.current,
    columns: toCompactSelection(selection?.columns),
    rows: toCompactSelection(selection?.rows)
  }
}

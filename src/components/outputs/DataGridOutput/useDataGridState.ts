import { type GridSelection } from "@glideapps/glide-data-grid"
import { useRef, useState } from "react"

import { type DataGridState } from "./DataGridState.ts"
import { deserializeGridSelection } from "./deserialize-grid-selection.ts"
import { serializeGridSelection } from "./serialize-grid-selection.ts"

/**
 * Column widths, scroll offset and selection of a DataGrid, reported through `onStateChange`
 * so they can be restored from `initialState` after the grid is unmounted.
 */
export function useDataGridState(
  initialState: Partial<DataGridState> | undefined,
  onStateChange?: (state: DataGridState) => void
) {
  const persistedRef = useRef<DataGridState>({
    widths: initialState?.widths ?? {},
    scroll: initialState?.scroll ?? { left: 0, top: 0 },
    selection: initialState?.selection
  })

  const [widths, setWidths] = useState(persistedRef.current.widths)
  const [selection, setSelection] = useState(() => deserializeGridSelection(persistedRef.current.selection))
  const [initialScroll] = useState(persistedRef.current.scroll)

  const persist = (patch: Partial<DataGridState>) => {
    persistedRef.current = { ...persistedRef.current, ...patch }
    onStateChange?.(persistedRef.current)
  }

  const resizeColumn = (columnIndex: number, size: number) => {
    const nextWidths = { ...persistedRef.current.widths, [columnIndex]: size }
    setWidths(nextWidths)
    persist({ widths: nextWidths })
  }

  const changeSelection = (nextSelection: GridSelection) => {
    setSelection(nextSelection)
    persist({ selection: serializeGridSelection(nextSelection) })
  }

  const changeScroll = (left: number, top: number) => {
    persist({ scroll: { left, top } })
  }

  return { widths, selection, initialScroll, resizeColumn, changeSelection, changeScroll }
}

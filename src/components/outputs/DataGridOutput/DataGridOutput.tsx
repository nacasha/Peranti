import { type DataEditorProps, DataEditor, GridCellKind } from "@glideapps/glide-data-grid"
import { type FC, type UIEvent, useCallback, useMemo, useRef } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Theme } from "src/enums/theme-2"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import { createDataGridColumns } from "./create-data-grid-columns.ts"
import { DataGridDarkTheme } from "./data-grid-dark-theme.ts"
import { getDataGridCellText } from "./get-data-grid-cell-text.ts"
import { parseDataGridRows } from "./parse-data-grid-rows.ts"
import { useDataGridState } from "./useDataGridState.ts"

import "./DataGridOutput.scss"

interface DataGridOutputProps extends OutputComponentProps {}

export const DataGridOutput: FC<DataGridOutputProps> = (props) => {
  const { label, fieldKey, value = "", initialState, onStateChange } = props

  const theme = useSelector(() => interfaceStore.resolvedTheme)
  const { widths, selection, initialScroll, resizeColumn, changeSelection, changeScroll } =
    useDataGridState(initialState, onStateChange)

  /**
   * Keep showing the last valid rows while the value is not (yet) valid JSON
   */
  const lastValidRowsRef = useRef<unknown[]>([])
  const rows = useMemo(() => {
    const parsedRows = parseDataGridRows(value)
    if (parsedRows) {
      lastValidRowsRef.current = parsedRows
    }
    return lastValidRowsRef.current
  }, [value])

  const firstRowKeys = JSON.stringify(rows[0])
  const columns = useMemo(
    () => createDataGridColumns(rows[0], widths),
    [firstRowKeys, widths]
  )

  const getCellContent = useCallback<DataEditorProps["getCellContent"]>(
    ([columnIndex, rowIndex]) => {
      const text = getDataGridCellText(rows[rowIndex], columnIndex)

      return {
        kind: GridCellKind.Text,
        allowOverlay: false,
        readonly: true,
        data: text,
        displayData: text
      }
    },
    [rows]
  )

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollTop } = event.target as HTMLElement
    changeScroll(scrollLeft, scrollTop)
  }

  return (
    <div className="DataGridOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <div className="DataGridOutput-content" onScrollCapture={handleScroll}>
        <DataEditor
          className="DataEditor"
          getCellContent={getCellContent}
          columns={columns}
          rows={rows.length}
          rowMarkers="both"
          theme={theme === Theme.Dark ? DataGridDarkTheme : undefined}
          gridSelection={selection}
          onGridSelectionChange={changeSelection}
          onColumnResize={(_column, newSize, columnIndex) => {
            resizeColumn(columnIndex, newSize)
          }}
          scrollOffsetX={initialScroll.left}
          scrollOffsetY={initialScroll.top}
          smoothScrollX
          smoothScrollY
          onPaste
          getCellsForSelection
          keybindings={{ search: true }}
        />
      </div>
    </div>
  )
}

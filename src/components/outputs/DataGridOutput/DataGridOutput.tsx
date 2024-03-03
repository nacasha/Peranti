import { type DataEditorProps, DataEditor, GridCellKind } from "@glideapps/glide-data-grid"
import { useCallback, type FC, useState, useEffect } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./DataGridOutput.scss"

const darkTheme = {
  accentColor: "#8c96ff",
  accentLight: "rgba(202, 206, 255, 0.253)",

  textDark: "#ffffff",
  textMedium: "#b8b8b8",
  textLight: "#a0a0a0",
  textBubble: "#ffffff",

  bgIconHeader: "#b8b8b8",
  fgIconHeader: "#000000",
  textHeader: "#a1a1a1",
  textHeaderSelected: "#000000",

  bgCell: "#16161b",
  bgCellMedium: "#202027",
  bgHeader: "#212121",
  bgHeaderHasFocus: "#474747",
  bgHeaderHovered: "#404040",

  bgBubble: "#212121",
  bgBubbleSelected: "#000000",

  bgSearchResult: "#423c24",

  borderColor: "rgba(225,225,225,0.2)",
  drilldownBorder: "rgba(225,225,225,0.4)",

  linkColor: "#4F5DFF"
}

function generateAlphabet(count: number) {
  if (count < 1) {
    return []
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const result = []

  for (let i = 0; i < count; i++) {
    let current = ""

    // Calculate the current letter
    current += alphabet[Math.floor(i % 26)]

    // If we need an additional letter, calculate and append it
    if (i >= 26) {
      current = alphabet[Math.floor(i / 26) - 1] + current
    }

    result.push(current)
  }

  return result
}

interface DataGridOutputProps extends OutputComponentProps {}

export const DataGridOutput: FC<DataGridOutputProps> = (props) => {
  const { label, fieldKey, value = "" } = props

  const parseColumns = (toBeParsed: any = []) => {
    try {
      let cc = []
      if (Array.isArray(toBeParsed)) {
        cc = generateAlphabet(toBeParsed.length)
      } else {
        cc = Object.keys(toBeParsed)
      }

      return cc.map((alphabet) => ({
        id: alphabet,
        title: alphabet,
        width: 150
      }))
    } catch (error) {
      console.log(error)
      return []
    }
  }

  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])

  const getData = useCallback<DataEditorProps["getCellContent"]>(
    ([col, row]) => {
      let content = ""

      if (data[row]) {
        const rowData: Record<string, any> = data[row]
        content = `${(Object.values(rowData)[col] ?? "")}`
      }

      return {
        kind: GridCellKind.Text,
        allowOverlay: false,
        readonly: true,
        data: content,
        displayData: content
      }
    },
    [data]
  )

  useEffect(() => {
    try {
      if (value.trim().length > 0) {
        const newData = JSON.parse(value)
        setData(newData)
      }
    } catch (error) {
      console.log(error)
    }
  }, [value])

  useEffect(() => {
    const parsedColumns = parseColumns(data[0])
    setColumns(parsedColumns)
  }, [JSON.stringify(data[0])])

  return (
    <div className="DataGridOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <div className="DataGridOutput-content">
        <DataEditor
          className="DataEditor"
          getCellContent={getData}
          columns={columns}
          rows={Math.max(data.length)}
          onPaste
          getCellsForSelection
          smoothScrollX
          smoothScrollY
          onColumnResize={(column, newSize) => {
            setColumns((cols) => cols.map((col) => {
              if (col.id !== column.id) {
                return col
              }
              return {
                ...col,
                width: newSize
              }
            }))
          }}
          rowMarkers="both"
          theme={darkTheme}
        />
      </div>
    </div>
  )
}

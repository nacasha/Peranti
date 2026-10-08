import { useEffect, useRef, useState, type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { Icons } from "src/constants/icons"
import { ClipboardService } from "src/services/clipboard-service"
import { type OutputComponentProps } from "src/types/OutputComponentProps.ts"
import { parseKeyValueRows, type KeyValueFields, type KeyValueValues } from "src/utils/parse-key-value-rows"

import "./KeyValueOutput.scss"

interface KeyValueOutputProps extends OutputComponentProps<KeyValueValues | string> {
  fields?: KeyValueFields
}

export const KeyValueOutput: FC<KeyValueOutputProps> = (props) => {
  const { fieldKey, label = "Output", value, fields, onContextMenu } = props
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => { clearTimeout(copiedTimeoutRef.current) }, [])

  const rows = parseKeyValueRows(value, fields)

  const handleClickRow = async(index: number, rowValue: string | number) => {
    await ClipboardService.copyAsText(`${rowValue}`)

    clearTimeout(copiedTimeoutRef.current)
    setCopiedIndex(index)
    copiedTimeoutRef.current = setTimeout(() => { setCopiedIndex(null) }, 1500)
  }

  return (
    <div className="KeyValueOutput" style={{ gridArea: fieldKey }} onContextMenu={onContextMenu}>
      <AppletComponentHead label={label} />
      <div className="KeyValueOutput-rows">
        {rows.map((row, index) => (
          <button
            key={`${row.label}-${index}`}
            className="KeyValueOutput-row"
            onClick={() => { void handleClickRow(index, row.value) }}
          >
            <span className="KeyValueOutput-label">{row.label}</span>
            <span className="KeyValueOutput-value">{row.value}</span>
            {copiedIndex === index
              ? <Icons.CopyDone className="KeyValueOutput-icon is-copied" size={15} aria-hidden />
              : <Icons.Copy className="KeyValueOutput-icon" size={15} aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  )
}

import { type FC, useId } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./TextOutput.scss"

export const TextOutput: FC<OutputComponentProps> = (props) => {
  const id = useId()
  const { value, label = "Output", onContextMenu, fieldKey } = props

  return (
    <div className="TextOutput" style={{ gridArea: fieldKey }} onContextMenu={onContextMenu}>
      <AppletComponentHead label={label} />
      <input id={id} value={value} readOnly autoComplete="off" />
    </div>
  )
}

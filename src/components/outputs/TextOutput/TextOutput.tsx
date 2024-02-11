import { type FC, useId } from "react"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import type { OutputComponentProps } from "src/types/OutputComponentProps.ts"

import "./TextOutput.scss"

export const TextOutput: FC<OutputComponentProps> = (props) => {
  const id = useId()
  const { value, label = "Output", onContextMenu } = props

  return (
    <div className="TextOutput" onContextMenu={onContextMenu}>
      <ComponentLabel label={label} />
      <input id={id} value={value} readOnly autoComplete="off" />
    </div>
  )
}

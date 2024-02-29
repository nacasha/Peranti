import { useId, type FC } from "react"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./TextAreaOutput-3.scss"

interface TextAreaOutputProps extends OutputComponentProps {}

export const TextAreaOutput: FC<TextAreaOutputProps> = (props) => {
  const id = useId()
  const { value, label = "Output", onContextMenu, fieldKey } = props

  return (
    <div className="TextAreaOutput" style={{ gridArea: fieldKey }} onContextMenu={onContextMenu}>
      <ComponentLabel label={label} />
      <textarea
        id={id}
        value={value}
        readOnly
      />
    </div>
  )
}

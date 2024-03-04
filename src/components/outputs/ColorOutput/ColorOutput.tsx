import { type FC } from "react"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./ColorOutput.scss"

interface ColorOutputProps extends OutputComponentProps {}

export const ColorOutput: FC<ColorOutputProps> = (props) => {
  const { fieldKey, label, value } = props

  return (
    <div className="ColorOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead label={label} />
      <div className="ColorOutput-content">
        <div className="ColorOutput-pallete" style={{ backgroundColor: value }}></div>
      </div>
    </div>
  )
}

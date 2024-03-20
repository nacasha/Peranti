import { type FC } from "react"
import { Runner } from "react-runner"

import { AppletComponentHead } from "src/components/common/ComponentLabel"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./ReactOutput.scss"

interface ReactOutputProps extends OutputComponentProps {}

export const ReactOutput: FC<ReactOutputProps> = (props) => {
  const { label, value, fieldKey } = props

  return (
    <div className="ReactOutput" style={{ gridArea: fieldKey }}>
      <AppletComponentHead showMaximize label={label} />
      <div className="ReactOutput-area">
        <div className="ReactOutput-content">
          <Runner code={value} />
        </div>
      </div>
    </div>
  )
}

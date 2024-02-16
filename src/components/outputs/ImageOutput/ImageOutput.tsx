import { type FC } from "react"

import { ComponentLabel } from "src/components/common/ComponentLabel"
import { ZoomableContent } from "src/components/common/ZoomableContent"
import { type OutputComponentProps } from "src/types/OutputComponentProps"

import "./ImageOutput.scss"

interface ImageOutputProps extends OutputComponentProps<string> {
  width?: number
  showControl?: boolean
}

export const ImageOutput: FC<ImageOutputProps> = (props) => {
  const { value = "", label, initialState, onStateChange, onContextMenu } = props

  return (
    <div className="ImageOutput">
      <ComponentLabel label={label} />
      <div className="ImageOutput-inner" onContextMenu={onContextMenu}>
        <ZoomableContent
          initialState={initialState}
          onStageChange={onStateChange}
        >
          <div className="ImageOutput-image">
            {value && <img src={value} />}
          </div>
        </ZoomableContent>
      </div>
    </div>
  )
}

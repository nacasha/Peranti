import { type FC, useEffect } from "react"
import { useStore } from "reactflow"

import { type InputComponentProps } from "src/types/InputComponentProps"

export const PipelineEditorTransformListener: FC<InputComponentProps> = (props) => {
  const { onStateChange } = props
  const transform = useStore((state) => state.transform)

  useEffect(() => {
    return () => {
      if (onStateChange) {
        onStateChange({ transform })
      }
    }
  }, [transform])

  return null
}

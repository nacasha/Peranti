import { useContext, type FC } from "react"

import { Button } from "src/components/common/Button"
import { Icons } from "src/constants/icons"
import { type InputComponentProps } from "src/types/InputComponentProps.ts"

import { PipelineEditorContext } from "./PipelineEditor.tsx"

export const PipelineEditorButtons: FC<InputComponentProps> = (props) => {
  const { readOnly } = props
  const pipelineEditorContext = useContext(PipelineEditorContext)

  const handleAddInput = () => {
    pipelineEditorContext.addInputOrOutput("input")
  }

  const handleAddOutput = () => {
    pipelineEditorContext.addInputOrOutput("output")
  }

  if (readOnly) {
    return
  }

  return (
    <div className="PipelineEditorButtons">
      <Button icon={Icons.Plus} onClick={handleAddInput}>Add Input</Button>
      <Button icon={Icons.Plus} onClick={handleAddOutput}>Add Output</Button>
      <Button icon={Icons.Plus} onClick={handleAddInput}>Add Tool</Button>
    </div>
  )
}

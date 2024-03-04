import { type FC, createContext } from "react"
import { ReactFlowProvider } from "reactflow"
import "reactflow/dist/style.css"

import { type InputComponentProps } from "src/types/InputComponentProps.ts"

import { PipelineEditorCanvas } from "./PipelineEditorCanvas.tsx"
import { PipelineEditorStore } from "./PipelineEditorStore.ts"
import { PipelineEditorTransformListener } from "./PipelineEditorTransformListener.tsx"

import "./PipelineEditor.scss"

export const PipelineEditorContext = createContext<PipelineEditorStore>({} as any)

export const PipelineEditor: FC<InputComponentProps<any>> = (props) => {
  const { value = {}, onValueChange, readOnly } = props

  return (
    <PipelineEditorContext.Provider
      value={new PipelineEditorStore(
        value.nodes,
        value.edges,
        onValueChange,
        readOnly
      )}
    >
      <ReactFlowProvider>
        {/* <PipelineEditorButtons {...props} /> */}
        <PipelineEditorCanvas {...props} />
        <PipelineEditorTransformListener {...props} />
      </ReactFlowProvider>
    </PipelineEditorContext.Provider>
  )
}

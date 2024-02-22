import { useCallback, type FC, useEffect } from "react"
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  ReactFlowProvider
} from "reactflow"
import "reactflow/dist/style.css"

import { type InputComponentProps } from "src/types/InputComponentProps.ts"

import { PipelineEditorState } from "./PipelineEditorState.tsx"
import { PipelineInput } from "./PipelineInput.tsx"
import { PipelineItem } from "./PipelineItem.tsx"
import { PipelineOutput } from "./PipelineOutput.tsx"

const initialNodes = [
  { id: "hash-1", type: "applet", position: { x: 0, y: 0 }, data: { appletId: "hash" } },
  { id: "base64-encode-decode-1", type: "applet", position: { x: 0, y: 100 }, data: { appletId: "base64-encode-decode" } },
  { id: "text-transform-1", type: "applet", position: { x: 0, y: 200 }, data: { appletId: "text-transform" } },
  { id: "generate-uuid-1", type: "applet", position: { x: 0, y: 200 }, data: { appletId: "generate-uuid" } },
  { id: "sort-list-1", type: "applet", position: { x: 0, y: 200 }, data: { appletId: "sort-list" } },
  { id: "input-input", type: "appletInput", position: { x: 0, y: 300 }, data: { component: "Text", key: "input", label: "Number of Generated UUID" } },
  { id: "input-input2", type: "appletInput", position: { x: 0, y: 300 }, data: { component: "Text", key: "input2", label: "TextCase" } },
  { id: "output-output", type: "appletOutput", position: { x: 0, y: 400 }, data: { component: "Code", key: "output", label: "List" } },
  { id: "output-output2", type: "appletOutput", position: { x: 0, y: 600 }, data: { component: "Code", key: "output2", label: "List 2" } }
]

const nodeTypes = {
  applet: PipelineItem,
  appletInput: PipelineInput,
  appletOutput: PipelineOutput
}

export const PipelineEditor: FC<InputComponentProps<any>> = (props) => {
  const { onValueChange, initialState, defaultValue } = props
  const initialViewport = initialState
    ? {
      x: initialState?.transform[0],
      y: initialState?.transform[1],
      zoom: initialState?.transform[2]
    }
    : undefined

  const [nodes, , onNodesChange] = useNodesState(defaultValue?.nodes ?? initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultValue?.edges ?? [])

  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds))
    },
    [setEdges]
  )

  const saveState = () => {
    onValueChange({ nodes, edges })
  }

  useEffect(() => {
    saveState()
  }, [nodes, edges])

  return (
    <ReactFlowProvider>
      <div style={{ flex: 1, border: "1px solid var(--border-color)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          defaultViewport={initialViewport}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
        </ReactFlow>
      </div>

      <PipelineEditorState {...props} />
    </ReactFlowProvider>
  )
}

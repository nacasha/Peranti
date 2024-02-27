import NiceModal from "@ebay/nice-modal-react"
import { useContext, type FC, useEffect } from "react"
import { Item, type ItemParams, useContextMenu } from "react-contexify"
import ReactFlow, { Controls, Background, BackgroundVariant, useReactFlow } from "reactflow"

import { ContextMenu } from "src/components/common/ContextMenu/ContextMenu.tsx"
import { ContextMenuKeys } from "src/constants/context-menu-keys.ts"
import { useSelector } from "src/hooks/useSelector.ts"
import { type InputComponentProps } from "src/types/InputComponentProps.ts"

import { PipelineEditorContext } from "./PipelineEditor.tsx"
import { PipelineItemInput } from "./PipelineItemInput.tsx"
import { PipelineItemOutput } from "./PipelineItemOutput.tsx"
import { PipelineItemTool } from "./PipelineItemTool.tsx"
import { PipelineModalAddNode } from "./PipelineModalAddNode.tsx"

const nodeTypes = {
  applet: PipelineItemTool,
  appletInput: PipelineItemInput,
  appletOutput: PipelineItemOutput
}

export const PipelineEditorCanvas: FC<InputComponentProps> = (props) => {
  const { show } = useContextMenu()
  const { screenToFlowPosition } = useReactFlow()
  const { initialState, readOnly } = props
  const defaultViewport = readOnly
    ? undefined
    : {
      x: initialState?.transform[0] ?? 0,
      y: initialState?.transform[1] ?? 0,
      zoom: initialState?.transform[2] ?? 0.65
    }

  const pipelineEditorContext = useContext(PipelineEditorContext)
  const { onConnect, onEdgesChange, onNodesChange, save } = pipelineEditorContext
  const nodes = useSelector(() => pipelineEditorContext.nodes)
  const edges = useSelector(() => pipelineEditorContext.edges)

  const handleContextMenu = (event: any) => {
    show({
      event,
      id: ContextMenuKeys.PipelineEditor
    })
  }

  useEffect(() => {
    return () => {
      save()
    }
  }, [])

  const handleAddInput = (params: ItemParams) => {
    const { clientX, clientY } = params.triggerEvent
    pipelineEditorContext.addInputOrOutput("input", screenToFlowPosition({ x: clientX, y: clientY }))
  }

  const handleAddOutput = (params: ItemParams) => {
    const { clientX, clientY } = params.triggerEvent
    pipelineEditorContext.addInputOrOutput("output", screenToFlowPosition({ x: clientX, y: clientY }))
  }

  const handleClickAddTool = (params: ItemParams) => {
    const { clientX, clientY } = params.triggerEvent
    void NiceModal.show(PipelineModalAddNode, {
      onSelectTool: (tool) => {
        pipelineEditorContext.addTool(tool, { x: clientX, y: clientY })
      }
    })
  }

  return (
    <div style={{ flex: 1, border: "1px solid var(--border-color)", borderRadius: "var(--border-radius)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        defaultViewport={defaultViewport}
        fitView={readOnly}
        onContextMenu={handleContextMenu}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
      </ReactFlow>

      <ContextMenu id={ContextMenuKeys.PipelineEditor}>
        <Item id="addInput" onClick={handleAddInput}>
          Add Input
        </Item>
        <Item id="addOutput" onClick={handleAddOutput}>
          Add Output
        </Item>
        <Item id="addTool" onClick={handleClickAddTool}>
          Add Tool
        </Item>
      </ContextMenu>
    </div>
  )
}

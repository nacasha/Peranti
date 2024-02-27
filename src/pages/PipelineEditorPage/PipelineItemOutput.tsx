import NiceModal from "@ebay/nice-modal-react"
import { useContext } from "react"
import { type NodeProps, type Node } from "reactflow"

import { PipelineEditorContext } from "./PipelineEditor.js"
import { PipelineItem } from "./PipelineItem.js"
import { PipelineModalInputOutput } from "./PipelineModalInputOutput.js"

export const PipelineItemOutput = ({ data, id }: NodeProps) => {
  const { component, key, label } = data
  const { setNodes, nodes } = useContext(PipelineEditorContext)

  const handleSave = (state: any) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...state } }
      }
      return node
    })

    setNodes(updatedNodes)
  }

  const handleClickSetting = (node: Node) => {
    const { label } = node.data
    void NiceModal.show(PipelineModalInputOutput, {
      label,
      component,
      type: "output",
      onClickSave: handleSave
    })
  }

  return (
    <PipelineItem
      title={`Output: ${component}`}
      targets={[{ id: key, label }]}
      onClickSetting={handleClickSetting}
    />
  )
}

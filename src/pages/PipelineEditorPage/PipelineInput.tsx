import { Handle, Position } from "reactflow"

import { pipelineItemClasses } from "./PipelineItem.css"

export const PipelineInput = ({ data, isConnectable }: any) => {
  const { component, key, label } = data

  return (
    <div className={pipelineItemClasses.root}>
      <div className={pipelineItemClasses.title}>
        <div>{component}</div>
        <div>{label}</div>
      </div>
      <Handle
        type="source"
        id={key}
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  )
}

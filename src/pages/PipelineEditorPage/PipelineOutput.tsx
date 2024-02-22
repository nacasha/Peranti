import { Handle, Position } from "reactflow"

import { pipelineItemClasses } from "./PipelineItem.css"

export const PipelineOutput = ({ data, isConnectable }: any) => {
  const { component, key, label } = data

  return (
    <div className={pipelineItemClasses.root}>
      <div className={pipelineItemClasses.title}>
        <div>{component}</div>
        <div>{label}</div>
      </div>
      <Handle
        type="target"
        id={key}
        position={Position.Left}
        isConnectable={isConnectable}
      />
    </div>
  )
}

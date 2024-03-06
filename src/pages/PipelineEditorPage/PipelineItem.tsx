import { type FC } from "react"
import { type Node, Position, useNodeId, useStore } from "reactflow"

import { ButtonIcon } from "src/components/common/ButtonIcon"
import { Icons } from "src/constants/icons.js"

import { CustomHandle } from "./CustomHandle.js"

import "./PipelineItem.scss"

const itemHeight = 25
const itemGap = 10

interface PipelineItemProps {
  title: string
  icon?: string
  sources?: Array<Omit<PipelineItemHandleProps, "type" | "index">>
  targets?: Array<Omit<PipelineItemHandleProps, "type" | "index">>
  onClickSetting?: (node: Node) => void
}

export const PipelineItem: FC<PipelineItemProps> = (props) => {
  const { title, icon, sources = [], targets = [], onClickSetting } = props
  const numberOfFields = Math.max(sources.length, targets.length)

  const nodeInternals = useStore((s) => s.nodeInternals)
  const nodeId = useNodeId()

  const handleClickSetting = () => {
    if (nodeId && onClickSetting) {
      const node = nodeInternals.get(nodeId)
      if (node) {
        onClickSetting(node)
      }
    }
  }

  return (
    <div className="PipelineItem">
      <div className="PipelineItem-header">
        <div className="PipelineItem-header-title">
          {icon && <img src={icon} alt={title} />}
          <div>{title}</div>
        </div>
        {onClickSetting && (
          <div className="PipelineItem-header-action">
            <ButtonIcon onClick={handleClickSetting} tooltip="Customize" icon={Icons.Settings} />
          </div>
        )}
      </div>
      <div className="PipelineItem-body" style={{ height: ((itemHeight + itemGap) * numberOfFields) - itemGap }}>
        <div className="PipelineItem-body-inner">

          <div className="PipelineItem-handles-left">
            {targets.map((target, index) => (
              <PipelineItemHandle key={target.id} {...target} type="target" index={index} />
            ))}
          </div>

          <div className="PipelineItem-handles-right">
            {sources.map((source, index) => (
              <PipelineItemHandle key={source.id} {...source} type="source" index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PipelineItemHandleProps {
  id: string
  label: string
  type: "source" | "target"
  index: number
}

const PipelineItemHandle: FC<PipelineItemHandleProps> = (props) => {
  const { id, label, type, index } = props

  return (
    <div style={{ display: "flex", alignItems: "center", height: itemHeight, top: (itemHeight + itemGap) * index }}>
      <label>
        {label}
      </label>
      <CustomHandle
        id={id}
        type={type}
        position={type === "source" ? Position.Right : Position.Left}
        isConnectable={true}
      />
    </div>
  )
}

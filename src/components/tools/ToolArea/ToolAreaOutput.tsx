import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"

import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolOutputRenderer } from "../ToolOutputRenderer"

interface ToolAreaOutputProps {
  toolSessionId: string
  components: ToolOutput[]
  direction?: string
  className?: string
}

export const ToolAreaOutput: FC<ToolAreaOutputProps> = memo((props) => {
  const { toolSessionId, components: toolOutputs, direction, className } = props

  return (
    <div className={clsx("ToolAreaOutput", direction, className)}>
      {toolOutputs.map((toolOutput) => (
        <ToolOutputRenderer
          key={toolSessionId.concat(toolOutput.key)}
          toolOutput={toolOutput}
        />
      ))}
    </div>
  )
}, fastDeepEqual)

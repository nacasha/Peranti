import { clsx } from "clsx"
import { type FC } from "react"

import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolOutputRenderer } from "../ToolOutputRenderer"

interface ToolAreaOutputProps {
  toolInstanceId: string
  outputs: ToolOutput[]
  direction?: string
}

export const ToolAreaOutput: FC<ToolAreaOutputProps> = (props) => {
  const { toolInstanceId, outputs, direction } = props

  return (
    <div className={clsx("ToolAreaOutput", direction)}>
      {outputs.map((output) => (
        <ToolOutputRenderer
          key={toolInstanceId.concat(output.key as any)}
          field={output.key as any}
          label={output.label}
          component={output.component}
          props={output.props}
        />
      ))}
    </div>
  )
}

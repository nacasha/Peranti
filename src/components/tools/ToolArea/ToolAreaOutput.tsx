import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"

import { type ToolOutput } from "src/types/ToolOutput.ts"

import { ToolOutputRenderer } from "../ToolOutputRenderer"

interface ToolAreaOutputProps {
  toolSessionId: string
  components: ToolOutput[]
  direction?: string
}

export const ToolAreaOutput: FC<ToolAreaOutputProps> = memo((props) => {
  const { toolSessionId, components, direction } = props

  return (
    <div className={clsx("ToolAreaOutput", direction)}>
      {components.map((component) => (
        <ToolOutputRenderer
          key={toolSessionId.concat(component.key as any)}
          field={component.key as any}
          label={component.label}
          component={component.component}
          props={component.props}
        />
      ))}
    </div>
  )
}, fastDeepEqual)

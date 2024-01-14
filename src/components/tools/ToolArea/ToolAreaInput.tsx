import { clsx } from "clsx"
import { type FC } from "react"

import { type ToolInput } from "src/types/ToolInput.ts"

import { ToolInputRenderer } from "../ToolInputRenderer"

interface ToolAreaInputProps {
  toolSessionId: string
  inputs: ToolInput[]
  direction?: "horizontal" | "vertical"
}

export const ToolAreaInput: FC<ToolAreaInputProps> = (props) => {
  const { toolSessionId, inputs, direction } = props

  return (
    <div className={clsx("ToolAreaInput", direction)}>
      {inputs.map((input) => (
        <ToolInputRenderer
          key={toolSessionId.concat(input.key as any)}
          field={input.key as any}
          label={input.label}
          component={input.component}
          props={input.props}
          initialValue={input.defaultValue}
        />
      ))}
    </div>
  )
}

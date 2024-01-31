import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { memo, type FC, type FormEventHandler } from "react"

import { type ToolInput } from "src/types/ToolInput.ts"

import { ToolInputRenderer } from "../ToolInputRenderer"

interface ToolAreaInputProps {
  toolSessionId: string
  components: ToolInput[]
  direction?: "horizontal" | "vertical"
  readOnly?: boolean
  className?: string
}

export const ToolAreaInput: FC<ToolAreaInputProps> = memo((props) => {
  const { toolSessionId, components: toolInputs, direction, readOnly, className } = props

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
  }

  return (
    <form
      action="#"
      onSubmit={handleSubmit}
      className={clsx("ToolAreaInput", direction, className)}
    >
      {toolInputs.map((toolInput) => (
        <ToolInputRenderer
          key={toolSessionId.concat(toolInput.key)}
          toolInput={toolInput}
          readOnly={readOnly}
        />
      ))}
    </form>
  )
}, fastDeepEqual)

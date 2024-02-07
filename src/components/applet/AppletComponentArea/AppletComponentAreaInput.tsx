import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { memo, type FC, type FormEventHandler } from "react"

import { type AppletInput } from "src/types/AppletInput"

import { AppletInputRenderer } from "../AppletInputRenderer"

interface AppletComponentAreaInputProps {
  appletSessionId: string
  components: AppletInput[]
  direction?: "horizontal" | "vertical"
  readOnly?: boolean
  className?: string
}

export const AppletComponentAreaInput: FC<AppletComponentAreaInputProps> = memo((props) => {
  const { appletSessionId, components, direction, readOnly, className } = props

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
  }

  return (
    <form
      action="#"
      onSubmit={handleSubmit}
      className={clsx("AppletComponentAreaInput", direction, className)}
    >
      {components.map((inputComponent) => (
        <AppletInputRenderer
          key={appletSessionId.concat(inputComponent.key)}
          appletInput={inputComponent}
          readOnly={readOnly}
        />
      ))}
    </form>
  )
}, fastDeepEqual)

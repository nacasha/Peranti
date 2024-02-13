import { clsx } from "clsx"
import { type FC, type FormEventHandler } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletInputRenderer } from "../AppletInputRenderer"

interface AppletComponentAreaInputProps {
  className?: string
}

export const AppletComponentAreaInput: FC<AppletComponentAreaInputProps> = (props) => {
  const { className } = props

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const inputFields = useSelector(() => activeAppletStore.getActiveApplet().getInputFields())
  const inputAreaDirection = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting.inputAreaDirection)
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)
  const renderCounter = useSelector(() => activeAppletStore.getActiveApplet().renderCounter)

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
  }

  if (inputFields.length === 0) {
    return null
  }

  return (
    <form
      key={activeApplet.sessionId.concat(renderCounter.toString())}
      action="#"
      onSubmit={handleSubmit}
      className={clsx("AppletComponentAreaInput", inputAreaDirection, className)}
    >
      {inputFields.map((inputComponent) => (
        <AppletInputRenderer
          key={activeApplet.sessionId.concat(inputComponent.key)}
          appletInput={inputComponent}
          readOnly={isDeleted}
        />
      ))}
    </form>
  )
}

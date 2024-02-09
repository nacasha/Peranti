import { clsx } from "clsx"
import { memo, type FC, type FormEventHandler } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletInputRenderer } from "../AppletInputRenderer"

interface AppletComponentAreaInputProps {
  className?: string
}

export const AppletComponentAreaInput: FC<AppletComponentAreaInputProps> = memo((props) => {
  const { className } = props

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const inputFields = useSelector(() => activeAppletStore.getActiveApplet().getInputFields())
  const inputAreaDirection = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting.inputAreaDirection)
  const isDeleted = useSelector(() => activeAppletStore.getActiveApplet().isDeleted)

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
  }

  if (inputFields.length === 0) {
    return null
  }

  return (
    <form
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
}, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className
})

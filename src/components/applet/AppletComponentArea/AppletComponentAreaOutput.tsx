import { clsx } from "clsx"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletOutputRenderer } from "../AppletOutputRenderer"

interface AppletComponentAreaOutpuProps {
  className?: string
}

export const AppletComponentAreaOutput: FC<AppletComponentAreaOutpuProps> = (props) => {
  const { className } = props

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const outputFields = useSelector(() => activeAppletStore.getActiveApplet().getOutputFields())
  const inputAreaDirection = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting.outputAreaDirection)
  const renderCounter = useSelector(() => activeAppletStore.getActiveApplet().renderCounter)

  if (outputFields.length === 0) {
    return null
  }

  return (
    <div
      key={activeApplet.sessionId.concat(renderCounter.toString())}
      className={clsx("AppletComponentAreaOutput", inputAreaDirection, className)}
    >
      {outputFields.map((outputComponent) => (
        <AppletOutputRenderer
          key={activeApplet.sessionId.concat(outputComponent.key)}
          appletOutput={outputComponent}
        />
      ))}
    </div>
  )
}

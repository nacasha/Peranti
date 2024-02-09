import { clsx } from "clsx"
import { memo, type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletOutputRenderer } from "../AppletOutputRenderer"

interface AppletComponentAreaOutpuProps {
  className?: string
}

export const AppletComponentAreaOutput: FC<AppletComponentAreaOutpuProps> = memo((props) => {
  const { className } = props

  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const outputFields = useSelector(() => activeAppletStore.getActiveApplet().getOutputFields())
  const inputAreaDirection = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting.outputAreaDirection)

  if (outputFields.length === 0) {
    return null
  }

  return (
    <div className={clsx("AppletComponentAreaOutput", inputAreaDirection, className)}>
      {outputFields.map((outputComponent) => (
        <AppletOutputRenderer
          key={activeApplet.sessionId.concat(outputComponent.key)}
          appletOutput={outputComponent}
        />
      ))}
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.className === nextProps.className
})

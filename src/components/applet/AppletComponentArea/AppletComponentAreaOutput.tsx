import { clsx } from "clsx"
import fastDeepEqual from "fast-deep-equal"
import { memo, type FC } from "react"

import { type AppletOutput } from "src/types/AppletOutput"

import { AppletOutputRenderer } from "../AppletOutputRenderer"

interface AppletComponentAreaOutpuProps {
  appletSessionId: string
  components: AppletOutput[]
  direction?: string
  className?: string
}

export const AppletComponentAreaOutput: FC<AppletComponentAreaOutpuProps> = memo((props) => {
  const { appletSessionId, components, direction, className } = props

  return (
    <div className={clsx("AppletComponentAreaOutput", direction, className)}>
      {components.map((outputComponent) => (
        <AppletOutputRenderer
          key={appletSessionId.concat(outputComponent.key)}
          appletOutput={outputComponent}
        />
      ))}
    </div>
  )
}, fastDeepEqual)

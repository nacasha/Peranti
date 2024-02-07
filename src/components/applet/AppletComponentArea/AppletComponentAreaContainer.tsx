import { clsx } from "clsx"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector.ts"
import { activeAppletStore } from "src/services/active-applet-store"
import { interfaceStore } from "src/services/interface-store"

interface AppletComponentAreaContainerProps {
  children: React.ReactNode
}

export const AppletComponentAreaContainer: FC<AppletComponentAreaContainerProps> = ({ children }) => {
  const isBatchEnabled = useSelector(() => activeAppletStore.getActiveApplet().isBatchModeEnabled)
  const layoutSetting = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  const { direction, reversed, gridTemplate } = layoutSetting

  const computedLayoutDirection = isBatchEnabled ? "horizontal-batch" : direction
  const isLayoutHorizontal = computedLayoutDirection === "horizontal"

  const computedStyles = isLayoutHorizontal
    ? { gridTemplateColumns: gridTemplate }
    : { gridTemplateRows: gridTemplate }

  const classNames = { "text-area-word-wrap": textAreaWordWrap, reversed }

  return (
    <div
      className={clsx("AppletComponentArea", computedLayoutDirection, classNames)}
      style={computedStyles}
    >
      {children}
    </div>
  )
}

import { type ClassValue, clsx } from "clsx"
import { type CSSProperties, type FC } from "react"

import { useSelector } from "src/hooks/useSelector.ts"
import { activeAppletStore } from "src/services/active-applet-store"
import { interfaceStore } from "src/services/interface-store"

interface AppletComponentAreaContainerProps {
  children: React.ReactNode
}

export const AppletComponentAreaContainer: FC<AppletComponentAreaContainerProps> = ({ children }) => {
  // const isBatchEnabled = useSelector(() => activeAppletStore.getActiveApplet().isBatchModeEnabled)
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)
  const layoutSetting = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting)
  const { areaType } = layoutSetting

  // const computedLayoutDirection = isBatchEnabled ? "horizontal-batch" : ""
  const classNames: ClassValue[] = ["AppletComponentArea", areaType, textAreaWordWrap && "text-area-word-wrap"]
  const styles: CSSProperties = {}

  if (areaType === "flex") {
    classNames.push(layoutSetting.areaFlexDirection)
  } else if (areaType === "grid") {
    styles.gridTemplate = layoutSetting.areaGridTemplate
  }

  return (
    <div className={clsx(classNames)} style={styles}>
      {children}
    </div>
  )
}

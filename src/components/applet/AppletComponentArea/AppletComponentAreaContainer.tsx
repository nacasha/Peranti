import { type ClassValue, clsx } from "clsx"
import { type CSSProperties, type FC } from "react"

import { useSelector } from "src/hooks/useSelector.ts"
import { activeAppletStore } from "src/services/active-applet-store"
import { interfaceStore } from "src/services/interface-store"

interface AppletComponentAreaContainerProps {
  children: React.ReactNode
}

export const AppletComponentAreaContainer: FC<AppletComponentAreaContainerProps> = ({ children }) => {
  /**
   * Batch mode state
   */
  const isBatchEnabled = useSelector(() => activeAppletStore.getActiveApplet().isBatchModeEnabled)

  /**
   * Field layout state
   */
  const textAreaWordWrap = useSelector(() => interfaceStore.textAreaWordWrap)

  /**
   * Area layout
   */
  const layoutSetting = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting)
  const { areaType } = layoutSetting

  /**
   * Maximized field state
   */
  const maximizedField = useSelector(() => activeAppletStore.getActiveApplet().maximizedField)

  const classNames: ClassValue[] = ["AppletComponentArea", areaType, textAreaWordWrap && "text-area-word-wrap"]
  const styles: CSSProperties = {}

  /**
   * Layout will be flex horizontally when batch mode is enabled
   */
  if (isBatchEnabled || maximizedField.enabled) {
    classNames.push(...["flex", "horizontal"])
  } else {
    if (areaType === "flex") {
      classNames.push(layoutSetting.areaFlexDirection)
    } else if (areaType === "grid") {
      styles.gridTemplate = layoutSetting.areaGridTemplate
    }
  }

  return (
    <div className={clsx(classNames)} style={styles}>
      {children}
    </div>
  )
}

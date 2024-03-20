import { type ClassValue, clsx } from "clsx"
import { type CSSProperties, type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletOutputRenderer } from "../AppletOutputRenderer"

interface AppletComponentAreaOutpuProps {
  className?: string
}

export const AppletComponentAreaOutput: FC<AppletComponentAreaOutpuProps> = (props) => {
  const { className: classNameProps } = props

  /**
   * Active applet info
   */
  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const outputFields = useSelector(() => activeAppletStore.getActiveApplet().getOutputFields())

  /**
   * Batch mode state
   */
  const isBatchEnabled = useSelector(() => activeAppletStore.getActiveApplet().isBatchModeEnabled)

  /**
   * Maximized field state
   */
  const maximizedField = useSelector(() => activeAppletStore.getActiveApplet().maximizedField)

  /**
   * Applet layout
   */
  const layoutSetting = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting)
  const { fieldsType } = layoutSetting

  const classNames: ClassValue[] = ["AppletComponentAreaOutput", fieldsType, classNameProps]
  const styles: CSSProperties = {}

  /**
   * Layout will be flex horizontally when batch mode is enabled
   */
  if (isBatchEnabled || maximizedField.enabled) {
    classNames.push(...["flex", "horizontal"])
  } else {
    if (fieldsType === "flex") {
      classNames.push(layoutSetting.fieldsOutputFlexDirection)
    } else if (fieldsType === "grid") {
      styles.gridTemplate = layoutSetting.fieldsOutputGridTemplate
    }
  }

  if (maximizedField.enabled && maximizedField.type !== "output") {
    return
  }

  if (outputFields.length === 0) {
    return null
  }

  return (
    <div
      className={clsx(classNames)}
      style={styles}
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

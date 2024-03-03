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
  const renderCounter = useSelector(() => activeAppletStore.getActiveApplet().renderCounter)

  /**
   * Maximized field state
   */
  const maximizedField = useSelector(() => activeAppletStore.getActiveApplet().maximizedField)

  /**
   * Applet layout
   */
  const layoutSetting = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting)

  const classNames: ClassValue[] = ["AppletComponentAreaOutput", layoutSetting.fieldsType, classNameProps]
  const styles: CSSProperties = {}

  if (layoutSetting.fieldsType === "flex") {
    classNames.push(layoutSetting.fieldsOutputFlexDirection)
  } else if (layoutSetting.fieldsType === "grid") {
    styles.gridTemplate = layoutSetting.fieldsOutputGridTemplate
  }

  if (maximizedField.enabled && maximizedField.type !== "output") {
    return
  }

  if (outputFields.length === 0) {
    return null
  }

  return (
    <div
      key={activeApplet.sessionId.concat(renderCounter.toString())}
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

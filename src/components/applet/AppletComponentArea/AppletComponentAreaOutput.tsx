import { type ClassValue, clsx } from "clsx"
import { type CSSProperties, type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"
import { groupKeyValueOutputs } from "src/utils/group-key-value-outputs"

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

  /**
   * Batch and maximize work on a single field, so grouping only applies to the normal view
   */
  const outputGroups = isBatchEnabled || maximizedField.enabled
    ? outputFields.map((output) => [output])
    : groupKeyValueOutputs(outputFields)

  if (outputFields.length === 0) {
    return null
  }

  return (
    <div
      className={clsx(classNames)}
      style={styles}
    >
      {outputGroups.map((group) => (
        <AppletOutputRenderer
          key={activeApplet.sessionId.concat(group[0].key, group.length > 1 ? "-group" : "")}
          appletOutput={group[0]}
          groupedOutputs={group.length > 1 ? group : undefined}
        />
      ))}
    </div>
  )
}

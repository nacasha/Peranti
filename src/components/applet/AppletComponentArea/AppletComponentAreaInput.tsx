import { type ClassValue, clsx } from "clsx"
import { type CSSProperties, type FC, type FormEventHandler } from "react"

import { useSelector } from "src/hooks/useSelector"
import { activeAppletStore } from "src/services/active-applet-store"

import { AppletInputRenderer } from "../AppletInputRenderer"

interface AppletComponentAreaInputProps {
  className?: string
}

export const AppletComponentAreaInput: FC<AppletComponentAreaInputProps> = (props) => {
  const { className: classNameProps } = props

  /**
   * Active applet info
   */
  const activeApplet = useSelector(() => activeAppletStore.getActiveApplet())
  const inputFields = useSelector(() => activeAppletStore.getActiveApplet().getInputFields())

  /**
   * Maximized field state
   */
  const maximizedField = useSelector(() => activeAppletStore.getActiveApplet().maximizedField)

  /**
   * Applet layout
   */
  const layoutSetting = useSelector(() => activeAppletStore.getActiveApplet().layoutSetting)

  const classNames: ClassValue[] = ["AppletComponentAreaInput", layoutSetting.fieldsType, classNameProps]
  const styles: CSSProperties = {}

  if (layoutSetting.fieldsType === "flex") {
    classNames.push(layoutSetting.fieldsInputFlexDirection)
  } else if (layoutSetting.fieldsType === "grid") {
    styles.gridTemplate = layoutSetting.fieldsinputGridTemplate
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
  }

  if (maximizedField.enabled && maximizedField.type !== "input") {
    return
  }

  if (inputFields.length === 0) {
    return
  }

  return (
    <form
      action="#"
      onSubmit={handleSubmit}
      className={clsx(classNames)}
      style={styles}
    >
      {inputFields.map((inputComponent) => (
        <AppletInputRenderer
          key={activeApplet.sessionId.concat(inputComponent.key)}
          appletInput={inputComponent}
        />
      ))}
    </form>
  )
}

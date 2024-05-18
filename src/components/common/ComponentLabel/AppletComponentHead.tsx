import { useContext, type FC, memo } from "react"

import { Icons } from "src/constants/icons"
import { AppletComponentContext } from "src/contexts/AppletInputContext"
import { activeAppletStore } from "src/services/active-applet-store"

import { ButtonIcon } from "../ButtonIcon"

import "./AppletComponentHead.scss"

interface AppletComponentHeadProps {
  label?: string
  showMaximize?: boolean
}

export const AppletComponentHead: FC<AppletComponentHeadProps> = memo((props) => {
  const { label, showMaximize } = props
  const componentContext = useContext(AppletComponentContext)

  const handleClickMaximize = () => {
    activeAppletStore.getActiveApplet().toggleMaximizedFieldKey({
      enabled: true,
      type: componentContext.type,
      key: componentContext.fieldKey
    })
  }

  return (
    <div className="AppletComponentHead">
      <label className="AppletComponentHead-label">
        {label}
      </label>
      <div className="AppletComponentHead-buttons">
        {showMaximize && (
          <ButtonIcon
            tooltip="Maximize"
            icon={Icons.FullScreen}
            iconSize={12}
            onClick={handleClickMaximize}
          />
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.label === nextProps.label
})

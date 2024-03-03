import { useContext, type FC } from "react"

import { Icons } from "src/constants/icons"
import { AppletComponentContent } from "src/contexts/AppletInputContext/AppletInputContext"
import { activeAppletStore } from "src/services/active-applet-store"

import { ButtonIcon } from "../ButtonIcon"

import "./AppletComponentHead.scss"

interface AppletComponentHeadProps {
  label?: string
  showMaximize?: boolean
}

export const AppletComponentHead: FC<AppletComponentHeadProps> = (props) => {
  const { label, showMaximize } = props
  const componentContext = useContext(AppletComponentContent)

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
}

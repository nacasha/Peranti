import { useContext, type FC } from "react"

import { Icons } from "src/constants/icons"
import { AppletComponentContent } from "src/contexts/AppletInputContext/AppletInputContext"
import { activeAppletStore } from "src/services/active-applet-store"

import { ButtonIcon } from "../ButtonIcon"

import "./ComponentLabel.scss"

interface AppletComponentHeadProps {
  label?: string
}

export const AppletComponentHead: FC<AppletComponentHeadProps> = (props) => {
  const { label } = props
  const componentContext = useContext(AppletComponentContent)

  const handleClickMaximize = () => {
    activeAppletStore.getActiveApplet().toggleMaximizedFieldKey({
      enabled: true,
      type: componentContext.type,
      key: componentContext.fieldKey
    })
  }

  return (
    <div className="ComponentLabel">
      <label className="ComponentLabel-label">
        {label}
      </label>
      <div className="ComponentLabel-buttons">
        <ButtonIcon
          tooltip="Maximize"
          icon={Icons.FullScreen}
          iconSize={12}
          onClick={handleClickMaximize}
        />
      </div>
    </div>
  )
}

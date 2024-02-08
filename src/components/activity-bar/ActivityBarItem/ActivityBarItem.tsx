import { clsx } from "clsx"
import { type FC } from "react"
import { useLocation } from "wouter"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"
import { type AppletConstructor } from "src/types/AppletConstructor"

import "./ActivityBarItem.scss"

interface ActivityBarItemProps {
  label: string
  icon: string
  menuId: string
  href?: string
  appletConstructor?: AppletConstructor
  onClick?: () => any
}

export const ActivityBarItem: FC<ActivityBarItemProps> = (props) => {
  const { icon, label, menuId, href, appletConstructor, onClick } = props
  const [, setLocation] = useLocation()
  const isActive = useSelector(() => interfaceStore.sidebarActiveMenuId === menuId)

  const onClickItem = () => () => {
    if (onClick) {
      onClick()
      return
    }

    if (appletConstructor) {
      sessionStore.findOrCreateSession(appletConstructor)
      return
    }

    if (interfaceStore.sidebarActiveMenuId !== menuId) {
      interfaceStore.setSidebarMenuId(menuId)
      interfaceStore.showSidebar()
    } else if (interfaceStore.sidebarActiveMenuId === menuId && interfaceStore.isFloatingSidebar) {
      interfaceStore.toggleSidebar()
    } else {
      interfaceStore.toggleSidebar()
    }

    if (href) {
      setLocation(href)
    }
  }

  return (
    <div className={clsx("ActivityBarItem", isActive && "active")} onClick={onClickItem()}>
      <div className="tooltip">
        {label}
      </div>
      <img src={icon} alt={label}/>
    </div>
  )
}

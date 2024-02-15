import { clsx } from "clsx"
import { type FC } from "react"
import { useLocation } from "wouter"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"
import { type AppletConstructor } from "src/types/AppletConstructor"

import { activitybarItemClasses } from "./ActivityBarItem.css"

interface ActivityBarItemProps {
  label: string
  icon: string
  menuId: string
  href?: string
  appletConstructor?: AppletConstructor
  onClick?: () => any
  clickHideOnFloatingSidebar?: boolean
}

export const ActivityBarItem: FC<ActivityBarItemProps> = (props) => {
  const { icon, label, menuId, href, appletConstructor, onClick, clickHideOnFloatingSidebar } = props
  const [, setLocation] = useLocation()
  const isActive = useSelector(() => interfaceStore.sidebarActiveMenuId === menuId)
  const isFloatingSidebar = useSelector(() => interfaceStore.isFloatingSidebar)

  const onClickItem = () => () => {
    const oldActiveMenuId = interfaceStore.sidebarActiveMenuId

    if (onClick) {
      onClick()
    } else if (appletConstructor) {
      sessionStore.findOrCreateSession(appletConstructor)
    } else if (oldActiveMenuId !== menuId) {
      interfaceStore.setSidebarMenuId(menuId)
      interfaceStore.showSidebar()
    }

    if (oldActiveMenuId !== interfaceStore.sidebarActiveMenuId) {
      interfaceStore.showSidebar()
    } else if (oldActiveMenuId === interfaceStore.sidebarActiveMenuId && oldActiveMenuId === menuId) {
      interfaceStore.toggleSidebar()
    }

    if (href) {
      setLocation(href)
    }

    if (clickHideOnFloatingSidebar && isFloatingSidebar) {
      interfaceStore.hideSidebar()
    }
  }

  const classNames = clsx([
    activitybarItemClasses.root,
    isActive && activitybarItemClasses.rootActive
  ])

  return (
    <div className={classNames} onClick={onClickItem()}>
      <div className={activitybarItemClasses.tooltip}>
        {label}
      </div>
      <img src={icon} alt={label}/>
    </div>
  )
}

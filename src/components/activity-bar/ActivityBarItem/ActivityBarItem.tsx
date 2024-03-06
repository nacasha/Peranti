import { clsx } from "clsx"
import { type FC } from "react"

import { Tooltip } from "src/components/common/Tooltip"
import { useSelector } from "src/hooks/useSelector"
import { type AppletConstructor } from "src/models/AppletConstructor"
import { interfaceStore } from "src/services/interface-store"
import { sessionStore } from "src/services/session-store"

import "./ActivityBarItem.scss"

interface ActivityBarItemProps {
  label: string
  icon: string
  menuId: string
  appletConstructor?: AppletConstructor
  onClick?: () => any
  clickHideOnFloatingSidebar?: boolean
}

export const ActivityBarItem: FC<ActivityBarItemProps> = (props) => {
  const { icon, label, menuId, appletConstructor, onClick, clickHideOnFloatingSidebar } = props
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

    if (clickHideOnFloatingSidebar && isFloatingSidebar) {
      interfaceStore.hideSidebar()
    }
  }

  const classNames = clsx([
    "ActivityBarItem",
    { active: isActive }
  ])

  return (
    <Tooltip mouseEnterDelay={0} placement="right" overlay={label}>
      <div className={classNames} onClick={onClickItem()}>
        <img src={icon} alt={label}/>
      </div>
    </Tooltip>
  )
}

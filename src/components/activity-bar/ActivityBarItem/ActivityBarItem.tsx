import { clsx } from "clsx"
import { type FC } from "react"
import { useLocation } from "wouter"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"
import { toolSessionStore } from "src/stores/toolSessionStore"
import { type ToolConstructor } from "src/types/ToolConstructor"

import "./ActivityBarItem.scss"

interface ActivityBarItemProps {
  label: string
  icon: string
  menuId: string
  href?: string
  toolConstructor?: ToolConstructor
}

export const ActivityBarItem: FC<ActivityBarItemProps> = (props) => {
  const { icon, label, menuId, href, toolConstructor } = props
  const [, setLocation] = useLocation()
  const isActive = useSelector(() => interfaceStore.sidebarActiveMenuId === menuId)

  const onClickItem = () => () => {
    if (toolConstructor) {
      toolSessionStore.findOrCreateSession(toolConstructor)
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

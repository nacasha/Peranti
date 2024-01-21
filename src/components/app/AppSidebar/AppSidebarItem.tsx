import { clsx } from "clsx"
import { type FC } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"

interface AppSidebarItemProps {
  menuId: string
  label: string
  icon: string
}

export const AppSidebarItem: FC<AppSidebarItemProps> = (props) => {
  const { icon, label, menuId } = props
  const isActive = useSelector(() => interfaceStore.sidebarActiveMenuId === menuId)

  const onClickItem = () => () => {
    if (interfaceStore.sidebarActiveMenuId !== menuId) {
      interfaceStore.setSidebarMenuId(menuId)
      interfaceStore.showSidebar()
    } else if (interfaceStore.sidebarActiveMenuId === menuId && interfaceStore.isFloatingSidebar) {
      interfaceStore.toggleSidebar()
    } else {
      interfaceStore.toggleSidebar()
    }
  }

  return (
    <div className={clsx("AppSidebarItem", isActive && "active")} onClick={onClickItem()}>
      <div className="tooltip">
        {label}
      </div>
      <img src={icon} alt={label}/>
    </div>
  )
}

import { clsx } from "clsx"
import { observer } from "mobx-react"
import { type FC } from "react"

import { interfaceStore } from "src/stores/interfaceStore"

interface AppSidebarItemProps {
  menuId: string
  label: string
  icon: string
}

export const AppSidebarItem: FC<AppSidebarItemProps> = observer((props) => {
  const { icon, label, menuId } = props

  const isActive = (
    interfaceStore.sidebarActiveMenuId === menuId
  )

  const onClickItem = () => () => {
    if (interfaceStore.sidebarActiveMenuId !== menuId) {
      interfaceStore.setSidebarMenuId(menuId)
      interfaceStore.showSidebar()
    } else {
      interfaceStore.toggleSidebar()
    }
  }

  return (
    <div className={clsx("AppSidebarItem", isActive && "active")} onClick={onClickItem()}>
      <div className="tooltip">
        {label}
      </div>
      <img src={icon} alt={label} />
    </div>
  )
})

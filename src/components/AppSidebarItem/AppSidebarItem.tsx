import "./AppSidebarItem.scss"

import { type FC, type ReactNode } from "react"

interface AppSidebarItemProps {
  active?: boolean
  children?: ReactNode
  onClick: () => any
}

export const AppSidebarItem: FC<AppSidebarItemProps> = (props) => {
  const { children, onClick, active } = props

  return (
    <div
      className={"AppSidebarItem".concat(active ? " active" : "")}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

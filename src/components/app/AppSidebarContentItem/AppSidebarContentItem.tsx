import { clsx } from "clsx"
import { type FC, type ReactNode } from "react"

import "./AppSidebarContentItem.scss"

interface AppSidebarContentItemProps {
  active?: boolean
  children?: ReactNode
  onClick: () => any
  onDoubleClick?: () => any
}

export const AppSidebarContentItem: FC<AppSidebarContentItemProps> = (props) => {
  const { children, onClick, onDoubleClick, active } = props

  return (
    <div
      className={clsx("AppSidebarContentItem", active && "active")}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  )
}

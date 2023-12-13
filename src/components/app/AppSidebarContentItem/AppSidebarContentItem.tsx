import { clsx } from "clsx"
import { type FC, type ReactNode } from "react"

import "./AppSidebarContentItem.scss"

interface AppSidebarContentItemProps {
  active?: boolean
  children?: ReactNode
  onClick: () => any
}

export const AppSidebarContentItem: FC<AppSidebarContentItemProps> = (props) => {
  const { children, onClick, active } = props

  return (
    <div
      className={clsx("AppSidebarContentItem", active && "active")}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

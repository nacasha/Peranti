import { type ClassValue, clsx } from "clsx"
import { type FC, type ReactNode } from "react"

import "./ToolSidebarItem.scss"

interface ToolSidebarItemProps {
  active?: boolean
  children?: ReactNode
  onClick: () => any
  onDoubleClick?: () => any
  className?: ClassValue
}

export const ToolSidebarItem: FC<ToolSidebarItemProps> = (props) => {
  const { children, onClick, onDoubleClick, active, className } = props

  return (
    <div
      className={clsx("ToolSidebarItem", active && "active", className)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  )
}

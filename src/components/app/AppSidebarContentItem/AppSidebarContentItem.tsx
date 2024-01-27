import { type ClassValue, clsx } from "clsx"
import { memo, type FC, type ReactNode } from "react"

import "./AppSidebarContentItem.scss"

interface AppSidebarContentItemProps {
  active?: boolean
  children?: ReactNode
  onClick: () => any
  onDoubleClick?: () => any
  className?: ClassValue
}

export const AppSidebarContentItem: FC<AppSidebarContentItemProps> = memo((props) => {
  const { children, onClick, onDoubleClick, active, className } = props

  return (
    <div
      className={clsx("AppSidebarContentItem", active && "active", className)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.active === nextProps.active
})

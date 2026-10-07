import { clsx } from "clsx"
import { type ComponentProps, type FC } from "react"
import { Item } from "react-contexify"

import { type Icon as IconType } from "src/constants/icons"

interface ContextMenuItemProps extends ComponentProps<typeof Item> {
  icon: IconType
  danger?: boolean
}

/**
 * Context menu row with a leading icon. Every menu uses this rather than a
 * bare `Item`, so all rows share the icon slot and line up.
 */
export const ContextMenuItem: FC<ContextMenuItemProps> = (props) => {
  const { icon: Icon, danger, className, children, ...itemProps } = props

  return (
    <Item {...itemProps} className={clsx(className, { danger })}>
      <Icon className="ContextMenuItem-icon" size={14} aria-hidden />
      {children}
    </Item>
  )
}

import { type ComponentProps, type FC } from "react"
import { Menu } from "react-contexify"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const ContextMenu: FC<ComponentProps<typeof Menu>> = (menuProps) => {
  const currentTheme = useSelector(() => interfaceStore.theme)

  return (
    <Menu
      {...menuProps}
      animation="fade"
      theme={currentTheme}
    />
  )
}

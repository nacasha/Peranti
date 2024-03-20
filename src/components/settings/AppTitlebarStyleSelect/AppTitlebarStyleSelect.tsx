import { type FC } from "react"

import { Dropdown } from "src/components/common/Dropdown"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { interfaceStore } from "src/services/interface-store"

export const AppTitleBarStyleSelect: FC = () => {
  const { appTitlebarStyle } = interfaceStore

  const onChange = (value: AppTitleBarStyle) => {
    interfaceStore.setAppTitlebarStyle(value)
  }

  return (
    <Dropdown<AppTitleBarStyle>
      options={[
        { label: "Commandbar", value: AppTitleBarStyle.Commandbar },
        { label: "Tabbar", value: AppTitleBarStyle.Tabbar }
      ]}
      onChange={onChange}
      value={appTitlebarStyle}
    />
  )
}

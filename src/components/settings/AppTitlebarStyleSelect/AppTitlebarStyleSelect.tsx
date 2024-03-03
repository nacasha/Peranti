import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { AppTitleBarStyle } from "src/enums/app-titlebar-style"
import { interfaceStore } from "src/services/interface-store"

export const AppTitleBarStyleSelect: FC = () => {
  const { appTitlebarStyle } = interfaceStore

  const onChange = (value: AppTitleBarStyle) => {
    interfaceStore.setAppTitlebarStyle(value)
  }

  return (
    <SelectInput<AppTitleBarStyle>
      fieldKey=""
      options={[
        { label: "Commandbar", value: AppTitleBarStyle.Commandbar },
        { label: "Tabbar", value: AppTitleBarStyle.Tabbar }
      ]}
      onValueChange={onChange}
      value={appTitlebarStyle}
    />
  )
}

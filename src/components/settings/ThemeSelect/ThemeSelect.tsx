import { type FC } from "react"

import { Dropdown } from "src/components/common/Dropdown"
import { Theme } from "src/enums/theme-2"
import { interfaceStore } from "src/services/interface-store"

export const ThemeSelect: FC = () => {
  const { theme } = interfaceStore

  const onChange = (value: string) => {
    interfaceStore.setTheme(value as Theme)
  }

  return (
    <Dropdown
      defaultValue={theme}
      options={[
        { label: "System", value: Theme.System },
        { label: "Dark", value: Theme.Dark },
        { label: "Light", value: Theme.Light }
      ]}
      onChange={onChange}
    />
  )
}

import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { Theme } from "src/enums/theme-2"
import { interfaceStore } from "src/services/interface-store"

export const ThemeSelect: FC = () => {
  const { theme } = interfaceStore

  const onChange = (value: Theme) => {
    interfaceStore.setTheme(value)
  }

  return (
    <SelectInput<Theme>
      fieldKey=""
      options={[
        { label: "Dark", value: Theme.Dark },
        { label: "Light", value: Theme.Light }
      ]}
      onValueChange={onChange}
      value={theme}
    />
  )
}

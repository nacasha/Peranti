import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { Theme } from "src/enums/Theme"
import { interfaceStore } from "src/stores/interfaceStore.ts"

export const ThemeSelect: FC = () => {
  const { theme } = interfaceStore

  const onChange = (value: Theme) => {
    interfaceStore.setTheme(value)
  }

  return (
    <SelectInput<Theme>
      options={[
        { label: "Dark", value: Theme.Dark },
        { label: "Light", value: Theme.Light }
      ]}
      onSubmit={onChange}
      defaultValue={theme}
    />
  )
}

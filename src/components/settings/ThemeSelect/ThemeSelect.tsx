import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { ThemeEnum } from "src/enums/ThemeEnum.ts"
import { interfaceStore } from "src/stores/interfaceStore.ts"

export const ThemeSelect: FC = () => {
  const { theme } = interfaceStore

  const onChange = (value: ThemeEnum) => {
    interfaceStore.theme = value
  }

  return (
    <SelectInput<ThemeEnum>
      options={[
        { label: "Dark", value: ThemeEnum.Dark },
        { label: "Light", value: ThemeEnum.Light }
      ]}
      onSubmit={onChange}
      defaultValue={theme}
    />
  )
}

import { type FC } from "react"

import { SelectInput } from "src/components/inputs/SelectInput"
import { interfaceStore } from "src/stores/interfaceStore.ts"

export const ThemeSelect: FC = () => {
  const { theme } = interfaceStore

  const onChange = (value: string) => {
    interfaceStore.theme = value
  }

  return (
    <SelectInput
      options={[
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" }
      ]}
      onSubmit={onChange}
      initialValue={theme}
    />
  )
}

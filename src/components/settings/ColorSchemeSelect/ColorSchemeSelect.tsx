import { type FC } from "react"

import { Dropdown } from "src/components/common/Dropdown"
import { ColorSchemes } from "src/constants/color-schemes"
import { type ColorScheme } from "src/enums/color-scheme"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const ColorSchemeSelect: FC = () => {
  const colorScheme = useSelector(() => interfaceStore.colorScheme)

  const onChange = (value: ColorScheme) => {
    interfaceStore.setColorScheme(value)
  }

  return (
    <Dropdown<ColorScheme>
      value={colorScheme}
      options={ColorSchemes}
      onChange={onChange}
    />
  )
}

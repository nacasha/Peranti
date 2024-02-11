import { type FC, useEffect } from "react"

import { Theme } from "src/enums/theme"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { darkThemeClass } from "src/styles/themes/dark.theme.css"
import { lightThemeClass } from "src/styles/themes/light.theme.css"

export const AppThemeListener: FC = () => {
  const theme = useSelector(() => interfaceStore.theme)

  const selectedTheme = {
    [Theme.Dark]: darkThemeClass,
    [Theme.Light]: lightThemeClass
  }[theme]

  useEffect(() => {
    window.document.body.className = selectedTheme
  }, [theme])

  return null
}

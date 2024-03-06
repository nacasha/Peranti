import { type FC, useEffect } from "react"

import { Theme } from "src/enums/theme-2"
import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const AppThemeListener: FC = () => {
  const theme = useSelector(() => interfaceStore.theme)

  const selectedTheme = {
    [Theme.Dark]: "dark",
    [Theme.Light]: "light"
  }[theme]

  useEffect(() => {
    window.document.body.className = selectedTheme
  }, [theme])

  return null
}

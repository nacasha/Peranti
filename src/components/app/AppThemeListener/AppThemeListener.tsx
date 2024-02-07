import { type FC, useEffect } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore"

export const AppThemeListener: FC = () => {
  const theme = useSelector(() => interfaceStore.theme)

  useEffect(() => {
    window.document.body.className = theme
  }, [theme])

  return null
}

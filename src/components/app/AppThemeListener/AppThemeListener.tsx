import { type FC, useEffect } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"

export const AppThemeListener: FC = () => {
  const resolvedTheme = useSelector(() => interfaceStore.resolvedTheme)

  useEffect(() => {
    window.document.body.className = resolvedTheme
  }, [resolvedTheme])

  return null
}

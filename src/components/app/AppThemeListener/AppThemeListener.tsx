import { type FC, useEffect } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/services/interface-store"
import { applyThemeToBody } from "src/utils/theme/apply-theme-to-body"

export const AppThemeListener: FC = () => {
  const resolvedTheme = useSelector(() => interfaceStore.resolvedTheme)
  const colorScheme = useSelector(() => interfaceStore.colorScheme)

  useEffect(() => {
    applyThemeToBody(resolvedTheme, colorScheme)
  }, [resolvedTheme, colorScheme])

  return null
}

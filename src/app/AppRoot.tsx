import { clsx } from "clsx"
import { type ReactNode } from "react"

import { useSelector } from "src/hooks/useSelector"
import { interfaceStore } from "src/stores/interfaceStore.ts"

/**
 * AppRoot
 *
 * @param param0 ReactNode
 * @returns
 */
export const AppRoot = ({ children }: { children: ReactNode }) => {
  const theme = useSelector(() => interfaceStore.theme)

  return (
    <div className={clsx("AppRoot", theme)}>
      {children}
    </div>
  )
}

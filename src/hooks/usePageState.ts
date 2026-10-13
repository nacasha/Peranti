import { useCallback, useContext, useState } from "react"

import { PageStateContext } from "src/contexts/PageStateContext"

/**
 * Like `useState`, but kept in the page's tab under `key`, so it comes back
 * after switching tabs. Plain state outside a page.
 */
export function usePageState<T>(key: string, initialValue: T | (() => T)) {
  const pageState = useContext(PageStateContext)

  const [value, setValue] = useState<T>(() => {
    const saved = pageState?.read(key)
    if (saved !== undefined) {
      return saved as T
    }
    return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue
  })

  const setPageValue = useCallback((next: T) => {
    setValue(next)
    pageState?.write(key, next)
  }, [pageState, key])

  return [value, setPageValue] as const
}

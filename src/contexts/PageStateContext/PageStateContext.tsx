import { createContext, useMemo, useRef, type FC, type ReactNode } from "react"

export interface PageStateContextValue {
  read: (key: string) => unknown
  write: (key: string, value: unknown) => void
}

/**
 * Where a page keeps the state of its parts, such as the picked tab, the
 * search keyword and the scroll position. Missing outside a page, then the
 * parts keep their state only while they're shown.
 */
export const PageStateContext = createContext<PageStateContextValue | undefined>(undefined)

interface PageStateProviderProps {
  /**
   * State saved by the tab last time, see `Applet.inputFieldsState`
   */
  initialState?: unknown
  onStateChange?: (state: Record<string, unknown>) => void
  children: ReactNode
}

/**
 * Keeps a page's state in its tab, so it comes back after switching tabs
 * or restarting the app
 */
export const PageStateProvider: FC<PageStateProviderProps> = ({ initialState, onStateChange, children }) => {
  const stateRef = useRef<Record<string, unknown>>(
    initialState && typeof initialState === "object" ? { ...initialState as Record<string, unknown> } : {}
  )
  const onStateChangeRef = useRef(onStateChange)
  onStateChangeRef.current = onStateChange

  const value = useMemo((): PageStateContextValue => ({
    read: (key) => stateRef.current[key],
    write: (key, next) => {
      if (stateRef.current[key] === next) {
        return
      }
      stateRef.current = { ...stateRef.current, [key]: next }
      onStateChangeRef.current?.(stateRef.current)
    }
  }), [])

  return <PageStateContext.Provider value={value}>{children}</PageStateContext.Provider>
}

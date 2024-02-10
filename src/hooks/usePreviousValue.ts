import { useEffect, useRef } from "react"

export function usePreviousValue<T = any>(state: any) {
  const previousApplet = useRef<T>(state)
  useEffect(() => {
    if (state !== previousApplet.current) {
      previousApplet.current = state
    }
  }, [state])
  return previousApplet.current
}

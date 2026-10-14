import { useEffect, useState } from "react"

/**
 * The current time, updated every `intervalMs`, so relative times such as
 * "5m ago" stay right while the page is open
 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => { setNow(Date.now()) }, intervalMs)
    return () => { clearInterval(timer) }
  }, [intervalMs])

  return now
}

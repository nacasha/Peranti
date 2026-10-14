import { useCallback, useContext, useRef } from "react"

import { PageStateContext } from "src/contexts/PageStateContext"

/**
 * Keeps a scroll area's position in the page's tab under `key`, and scrolls
 * back to it when shown again. Pass the returned ref to the scrolling element,
 * for SimpleBar through `scrollableNodeProps`.
 */
export function usePageScroll(key: string) {
  const pageState = useContext(PageStateContext)
  const elementRef = useRef<HTMLElement | null>(null)
  const scrollTopRef = useRef(0)
  const timerRef = useRef<number>()

  // React calls the previous ref with null before attaching a new one, also
  // when `key` changes, so leaving always saves under the key it was read with
  return useCallback((element: HTMLElement | null) => {
    const save = () => {
      window.clearTimeout(timerRef.current)
      pageState?.write(key, scrollTopRef.current)
    }

    const handleScroll = (event: Event) => {
      scrollTopRef.current = (event.currentTarget as HTMLElement).scrollTop
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(save, 200)
    }

    if (!element) {
      if (elementRef.current) {
        save()
      }
      elementRef.current = null
      return
    }

    elementRef.current = element
    const saved = pageState?.read(key)
    scrollTopRef.current = typeof saved === "number" ? saved : 0
    if (scrollTopRef.current > 0) {
      const top = scrollTopRef.current
      // After the content inside has laid out
      requestAnimationFrame(() => { element.scrollTop = top })
    }
    element.addEventListener("scroll", handleScroll, { passive: true })
  }, [pageState, key])
}

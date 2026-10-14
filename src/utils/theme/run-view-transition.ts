import { flushSync } from "react-dom"

/**
 * Run a state update inside a view transition so the layout change animates.
 * `className` is set on the root element while the transition runs, so CSS
 * can pick a different animation per kind of change.
 * Falls back to a plain update when unsupported or reduced motion is preferred.
 *
 * @param update
 * @param className
 */
export function runViewTransition(update: () => void, className?: string) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (!document.startViewTransition || prefersReducedMotion) {
    update()
    return
  }

  const root = document.documentElement
  if (className) {
    root.classList.add(className)
  }

  const transition = document.startViewTransition(() => {
    flushSync(update)
  })

  void transition.finished.finally(() => {
    if (className) {
      root.classList.remove(className)
    }
  })
}
